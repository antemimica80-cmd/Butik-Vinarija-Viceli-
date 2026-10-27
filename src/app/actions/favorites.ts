"use server";

import { z } from "zod";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const input = z.object({ type: z.enum(["winery", "wine", "grape"]), id: z.number().int().positive() });

export async function toggleFavorite(raw: { type: "winery" | "wine" | "grape"; id: number }) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "unauthenticated" };
  const { type, id } = input.parse(raw);
  const existing = await sql`select 1 from favorites where user_id = ${user.id} and entity_type = ${type} and entity_id = ${id}`;
  if (existing.length) {
    await sql`delete from favorites where user_id = ${user.id} and entity_type = ${type} and entity_id = ${id}`;
    return { ok: true as const, saved: false };
  }
  await sql`insert into favorites (user_id, entity_type, entity_id) values (${user.id}, ${type}, ${id}) on conflict do nothing`;
  return { ok: true as const, saved: true };
}

/** Move device-local favourites (slugs) into the signed-in account. */
export async function importLocalFavorites(slugs: string[]) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const };
  const clean = z.array(z.string().regex(/^[a-z0-9-]{1,80}$/)).max(200).parse(slugs);
  if (!clean.length) return { ok: true as const, count: 0 };
  const rows = await sql<{ id: number }[]>`select id from wineries where slug in ${sql(clean)} and status = 'published'`;
  for (const r of rows) {
    await sql`insert into favorites (user_id, entity_type, entity_id) values (${user.id}, 'winery', ${r.id}) on conflict do nothing`;
  }
  return { ok: true as const, count: rows.length };
}

export async function toggleVisited(wineryId: number) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "unauthenticated" };
  const id = z.number().int().positive().parse(wineryId);
  const existing = await sql`select 1 from winery_visits where user_id = ${user.id} and winery_id = ${id}`;
  if (existing.length) {
    await sql`delete from winery_visits where user_id = ${user.id} and winery_id = ${id}`;
    return { ok: true as const, visited: false };
  }
  await sql`insert into winery_visits (user_id, winery_id, visited_on) values (${user.id}, ${id}, current_date) on conflict do nothing`;
  return { ok: true as const, visited: true };
}
