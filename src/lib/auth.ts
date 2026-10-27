import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { sql } from "./db";
import { hmac, randomToken } from "./security";

export const SESSION_COOKIE = "atlas_session";
const SESSION_DAYS = 30;

export type Role = "visitor" | "owner" | "editor" | "admin";
export type SessionUser = { id: string; email: string; name: string | null; role: Role; locale: "hr" | "en" };

const tokenHash = (token: string) => hmac(`session:${token}`);

/** Current signed-in user for this request (memoised per request). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await sql<SessionUser[]>`
    select u.id, u.email, u.name, u.role, u.locale
    from sessions s join users u on u.id = s.user_id
    where s.token_hash = ${tokenHash(token)} and s.expires_at > now() and u.disabled_at is null`;
  return rows[0] ?? null;
});

export async function createSession(userId: string) {
  const token = randomToken();
  const h = await headers();
  await sql`insert into sessions (user_id, token_hash, expires_at, user_agent)
    values (${userId}, ${tokenHash(token)}, now() + make_interval(days => ${SESSION_DAYS}), ${h.get("user-agent")?.slice(0, 300) ?? null})`;
  await sql`update users set last_login_at = now() where id = ${userId}`;
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 3600,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await sql`delete from sessions where token_hash = ${tokenHash(token)}`;
  jar.delete(SESSION_COOKIE);
}

export const isStaff = (u: SessionUser | null) => !!u && (u.role === "admin" || u.role === "editor");
export const isAdmin = (u: SessionUser | null) => !!u && u.role === "admin";

/** Server-side authorisation check for winery management. Never trust the client. */
export async function canManageWinery(user: SessionUser | null, wineryId: number): Promise<boolean> {
  if (!user) return false;
  if (isStaff(user)) return true;
  const rows = await sql`select 1 from winery_owners where winery_id = ${wineryId} and user_id = ${user.id}`;
  return rows.length > 0;
}

export class AuthError extends Error {
  constructor(public code: "unauthenticated" | "forbidden") {
    super(code);
  }
}

export async function requireUser(): Promise<SessionUser> {
  const u = await getCurrentUser();
  if (!u) throw new AuthError("unauthenticated");
  return u;
}

export async function requireStaff(): Promise<SessionUser> {
  const u = await requireUser();
  if (!isStaff(u)) throw new AuthError("forbidden");
  return u;
}

export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser();
  if (!isAdmin(u)) throw new AuthError("forbidden");
  return u;
}

export async function requireWineryManager(wineryId: number): Promise<SessionUser> {
  const u = await requireUser();
  if (!(await canManageWinery(u, wineryId))) throw new AuthError("forbidden");
  return u;
}
