import "server-only";
import { redirect } from "next/navigation";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { canManageWinery, getCurrentUser, isStaff, isAdmin, type SessionUser } from "./auth";

/** Page guards: redirect to sign-in (or 404-equivalent) instead of throwing. */
export async function pageUser(locale: Locale, nextPath: string): Promise<SessionUser> {
  const u = await getCurrentUser();
  if (!u) redirect(`${getPathname({ href: "/login", locale })}?next=${encodeURIComponent(nextPath)}`);
  return u;
}

export async function pageStaff(locale: Locale, nextPath: string, adminOnly = false): Promise<SessionUser> {
  const u = await pageUser(locale, nextPath);
  if (adminOnly ? !isAdmin(u) : !isStaff(u)) redirect(getPathname({ href: "/account", locale }));
  return u;
}

export async function pageWineryManager(locale: Locale, wineryId: number, nextPath: string): Promise<SessionUser> {
  const u = await pageUser(locale, nextPath);
  if (!(await canManageWinery(u, wineryId))) redirect(getPathname({ href: "/owner", locale }));
  return u;
}
