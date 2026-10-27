import "server-only";
import { sql } from "../db";
import type { SessionUser } from "../auth";

export async function managedWineries(user: SessionUser) {
  return sql<{ id: number; slug: string; name: string; town: string | null; new_inquiries: number }[]>`
    select w.id, w.slug, w.name, l.town,
      (select count(*)::int from tasting_inquiries i where i.winery_id = w.id and i.status = 'new') as new_inquiries
    from winery_owners o join wineries w on w.id = o.winery_id
    left join winery_locations l on l.winery_id = w.id and l.is_primary
    where o.user_id = ${user.id} order by w.name`;
}

export async function wineryForOwner(slug: string) {
  const [w] = await sql<{ id: number; slug: string; name: string; status: string }[]>`select id, slug, name, status from wineries where slug = ${slug}`;
  return w ?? null;
}
