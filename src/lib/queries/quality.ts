import "server-only";
import { sql } from "../db";

/** Data-quality indicators for the admin dashboard. */
export async function qualitySummary() {
  const [s] = await sql<Record<string, number>[]>`
    select
      (select count(*)::int from wineries where status = 'published') as published,
      (select count(*)::int from wineries where status = 'draft') as drafts,
      (select count(*)::int from wineries w where not exists (select 1 from winery_locations l where l.winery_id = w.id and l.geom is not null)) as missing_coordinates,
      (select count(*)::int from wineries w where exists (select 1 from winery_locations l where l.winery_id = w.id and l.is_primary and l.precision in ('settlement','approximate'))) as approximate_location,
      (select count(*)::int from wineries where website is null) as missing_website,
      (select count(*)::int from wineries where email is null and phone is null) as missing_contact,
      (select count(*)::int from wineries w where not exists (
         select 1 from winery_locations where winery_id = w.id and source_id is not null)
         and not exists (select 1 from winery_grape_varieties where winery_id = w.id and source_id is not null)) as missing_sources,
      (select count(*)::int from wineries where verification = 'unverified') as unverified,
      (select count(*)::int from wineries where coalesce(content->'en'->>'short', '') = '' or coalesce(content->'hr'->>'short', '') = '') as missing_translation,
      (select count(*)::int from wine_awards where verification not in ('editor_verified','officially_verified')) as unverified_awards,
      (select count(*)::int from change_requests where status = 'pending') as pending_changes,
      (select count(*)::int from ownership_claims where status in ('pending','needs_info')) as pending_claims,
      (select count(*)::int from media where status = 'pending') as pending_media,
      (select count(*)::int from data_reports where status = 'open') as open_reports,
      (select count(*)::int from tasting_inquiries where status = 'new') as new_inquiries,
      (select count(*)::int from email_outbox where status in ('failed','no_provider')) as undelivered_email,
      (select count(*)::int from (
        select 1 from wineries a join wineries b on a.id < b.id and similarity(atlas_norm(a.name), atlas_norm(b.name)) > 0.6) x) as possible_duplicates`;
  return s;
}

export async function qualityLists() {
  const [missingWebsite, approximate, duplicates, unverified, translations, invalidUrls] = await Promise.all([
    sql<{ id: number; slug: string; name: string }[]>`select id, slug, name from wineries where website is null order by name limit 100`,
    sql<{ id: number; slug: string; name: string; town: string | null; precision: string }[]>`
      select w.id, w.slug, w.name, l.town, l.precision from wineries w join winery_locations l on l.winery_id = w.id and l.is_primary
      where l.precision in ('settlement','approximate') order by w.name limit 200`,
    sql<{ a_id: number; a: string; b_id: number; b: string; sim: number }[]>`
      select a.id as a_id, a.name as a, b.id as b_id, b.name as b, round(similarity(atlas_norm(a.name), atlas_norm(b.name))::numeric, 2)::float as sim
      from wineries a join wineries b on a.id < b.id and similarity(atlas_norm(a.name), atlas_norm(b.name)) > 0.6 order by sim desc limit 50`,
    sql<{ id: number; slug: string; name: string }[]>`select id, slug, name from wineries where verification = 'unverified' order by name limit 200`,
    sql<{ id: number; slug: string; name: string; missing: string }[]>`
      select id, slug, name, case when coalesce(content->'en'->>'short','') = '' then 'en' else 'hr' end as missing from wineries
      where coalesce(content->'en'->>'short', '') = '' or coalesce(content->'hr'->>'short', '') = '' order by name limit 200`,
    // URLs that are syntactically suspicious. Live link checking needs outbound HTTP and runs separately (scripts/check-links.ts).
    sql<{ id: number; slug: string; name: string; website: string }[]>`
      select id, slug, name, website from wineries where website is not null and website !~* '^https?://[^ /]+\\.[a-z]{2,}' order by name`,
  ]);
  return { missingWebsite, approximate, duplicates, unverified, translations, invalidUrls };
}
