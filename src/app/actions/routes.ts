"use server";

import { z } from "zod";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/norm";

const input = z.object({ title: z.string().trim().min(1).max(120), wineryIds: z.array(z.number().int().positive()).min(1).max(25) });

export async function saveRoute(raw: { title: string; wineryIds: number[] }) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "unauthenticated" };
  const d = input.parse(raw);
  const valid = await sql<{ id: number }[]>`select id from wineries where id in ${sql(d.wineryIds)} and status = 'published'`;
  const ids = d.wineryIds.filter((id) => valid.some((v) => v.id === id));
  if (!ids.length) return { ok: false as const, error: "invalid" };
  const slug = `${slugify(d.title) || "route"}-${randomBytes(3).toString("hex")}`;
  const [route] = await sql<{ id: string }[]>`
    insert into wine_routes (user_id, slug, title, is_public) values (${user.id}, ${slug}, ${sql.json({ hr: d.title, en: d.title })}, false) returning id`;
  for (const [i, id] of ids.entries()) await sql`insert into wine_route_stops (route_id, winery_id, position) values (${route.id}, ${id}, ${i})`;
  revalidatePath("/[locale]/account/routes", "page");
  return { ok: true as const, slug };
}

export async function deleteRoute(id: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const };
  await sql`delete from wine_routes where id = ${z.string().uuid().parse(id)} and user_id = ${user.id} and not is_editorial`;
  revalidatePath("/[locale]/account/routes", "page");
  return { ok: true as const };
}
