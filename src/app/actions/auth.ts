"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { sql } from "@/lib/db";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import { clientIpHash } from "@/lib/security";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

type AuthState = { error?: "invalid" | "exists" | "rate_limited" | "weak" } | null;

const safeNext = (next: unknown) => (typeof next === "string" && /^\/(hr|en)(\/[\w\-/]*)?$/.test(next) ? next : null);

async function home(role: string, locale: Locale) {
  const href = role === "admin" || role === "editor" ? "/admin" : role === "owner" ? "/owner" : "/account";
  return getPathname({ href: href as "/admin", locale });
}

export async function login(_: AuthState, fd: FormData): Promise<AuthState> {
  const locale = (await getLocale()) as Locale;
  const email = String(fd.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const password = String(fd.get("password") ?? "").slice(0, 200);
  const ip = await clientIpHash();
  if (!(await rateLimit(`login:${ip}`, 20, 900)) || !(await rateLimit(`login:${email}`, 10, 900))) return { error: "rate_limited" };
  const [u] = await sql<{ id: string; password_hash: string; role: string; disabled_at: string | null }[]>`
    select id, password_hash, role, disabled_at from users where lower(email) = ${email}`;
  // Always run a hash comparison so response time does not reveal whether the account exists.
  const ok = await verifyPassword(password, u?.password_hash ?? "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
  if (!u || !ok || u.disabled_at) return { error: "invalid" };
  await createSession(u.id);
  redirect(safeNext(fd.get("next")) ?? (await home(u.role, locale)));
}

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(10).max(200),
});

export async function register(_: AuthState, fd: FormData): Promise<AuthState> {
  const locale = (await getLocale()) as Locale;
  const p = registerSchema.safeParse({ name: fd.get("name"), email: fd.get("email"), password: fd.get("password") });
  if (!p.success) return { error: p.error.issues.some((i) => i.path[0] === "password") ? "weak" : "invalid" };
  if (!(await rateLimit(`register:${await clientIpHash()}`, 5, 3600))) return { error: "rate_limited" };
  const exists = await sql`select 1 from users where lower(email) = ${p.data.email}`;
  if (exists.length) return { error: "exists" };
  const [u] = await sql<{ id: string }[]>`
    insert into users (email, name, password_hash, role, locale) values (${p.data.email}, ${p.data.name}, ${await hashPassword(p.data.password)}, 'visitor', ${locale})
    returning id`;
  await createSession(u.id);
  redirect(getPathname({ href: "/account", locale }));
}

export async function logout() {
  const locale = (await getLocale()) as Locale;
  await destroySession();
  redirect(getPathname({ href: "/", locale }));
}

export async function updatePreferences(fd: FormData) {
  const u = await getCurrentUser();
  if (!u) return;
  const locale = fd.get("locale") === "en" ? "en" : "hr";
  const name = String(fd.get("name") ?? "").trim().slice(0, 120) || null;
  await sql`update users set locale = ${locale}, name = ${name} where id = ${u.id}`;
}
