import "server-only";
import type { PendingQuery, Row } from "postgres";
import { sql, textArray, intArray } from "../db";
import { tokenize } from "../norm";
import { norm } from "../norm";
import { PAGE_SIZE, SUPPORTED_STATES, VERIFIED_STATES } from "../constants";
import type { WineryFilters } from "../filters";
import type { LocalizedContent, LocalizedText } from "../content";

type Frag = PendingQuery<Row[]>;

const and = (parts: Frag[]): Frag => parts.reduce((a, b) => sql`${a} and ${b}`);

function point(f: WineryFilters) {
  return f.near ? sql`ST_SetSRID(ST_MakePoint(${f.near.lng}, ${f.near.lat}), 4326)::geography` : null;
}

/** Build the WHERE clause for winery discovery. All user input is parameterised. */
export function wineryWhere(f: WineryFilters): Frag {
  const c: Frag[] = [sql`w.status = 'published'`];
  const supported = textArray(SUPPORTED_STATES as string[]);
  const verified = textArray(VERIFIED_STATES as string[]);

  for (const t of tokenize(f.q)) {
    c.push(sql`(w.search_norm like ${"%" + t + "%"} or word_similarity(${t}, w.search_norm) >= 0.55)`);
  }
  if (f.region) c.push(sql`w.region_id in (select id from wine_regions where slug = any(${textArray(f.region)}))`);
  if (f.subregion) c.push(sql`w.subregion_id in (select id from wine_subregions where slug = any(${textArray(f.subregion)}))`);
  if (f.district) c.push(sql`w.district_id in (select id from wine_districts where slug = any(${textArray(f.district)}))`);
  if (f.site) {
    c.push(sql`exists (select 1 from wines wi join vineyard_sites vs on vs.id = wi.vineyard_site_id
      where wi.winery_id = w.id and wi.status = 'published' and vs.slug = ${f.site})`);
  }
  if (f.island) c.push(sql`regexp_replace(atlas_norm(w.island), '[^a-z0-9]+', '-', 'g') = any(${textArray(f.island)})`);
  if (f.town) {
    const t = norm(f.town);
    c.push(sql`exists (select 1 from winery_locations l where l.winery_id = w.id
      and (atlas_norm(l.town) = ${t} or atlas_norm(l.municipality) = ${t} or atlas_norm(l.county) like ${t + "%"}))`);
  }
  if (f.grape) {
    const g = textArray(f.grape);
    c.push(sql`(exists (select 1 from winery_grape_varieties wg join grape_varieties gv on gv.id = wg.grape_id
        where wg.winery_id = w.id and gv.slug = any(${g}))
      or exists (select 1 from wines wi join wine_grape_compositions cp on cp.wine_id = wi.id
        join grape_varieties gv on gv.id = cp.grape_id where wi.winery_id = w.id and wi.status = 'published' and gv.slug = any(${g})))`);
  }
  if (f.type) {
    c.push(sql`exists (select 1 from wines wi where wi.winery_id = w.id and wi.status = 'published'
      and wi.type::text = any(${textArray(f.type)}))`);
  }
  if (f.indigenous) {
    c.push(sql`exists (select 1 from winery_grape_varieties wg join grape_varieties gv on gv.id = wg.grape_id
      where wg.winery_id = w.id and gv.origin = 'indigenous')`);
  }
  if (f.cert) {
    c.push(sql`exists (select 1 from winery_certifications ce where ce.winery_id = w.id
      and ce.kind = any(${textArray(f.cert)}) and ce.verification::text = any(${verified})
      and (ce.valid_until is null or ce.valid_until >= current_date))`);
  }
  if (f.size) c.push(sql`w.size_category = any(${textArray(f.size)})`);
  if (f.family) c.push(sql`w.family_run is true`);
  if (f.foundedFrom) c.push(sql`w.founded_year >= ${f.foundedFrom}`);
  if (f.foundedTo) c.push(sql`w.founded_year <= ${f.foundedTo}`);
  for (const fac of f.facility ?? []) {
    const viaExperience = fac === "tasting"
      ? sql`or exists (select 1 from tasting_experiences te where te.winery_id = w.id and te.is_active
          and te.kind in ('tasting','cellar_tour','food_pairing') and te.verification::text = any(${supported}))`
      : sql``;
    c.push(sql`(exists (select 1 from winery_facilities wf where wf.winery_id = w.id and wf.facility = ${fac}
      and wf.verification::text = any(${supported})) ${viaExperience})`);
  }
  if (f.lang) {
    const l = textArray(f.lang);
    c.push(sql`(w.languages && ${l} or exists (select 1 from tasting_experiences te
      where te.winery_id = w.id and te.is_active and te.languages && ${l}))`);
  }
  if (f.competition || f.medal || f.awardYear || f.awarded) {
    const parts: Frag[] = [sql`aw.winery_id = w.id`, sql`aw.verification::text = any(${verified})`];
    if (f.competition) parts.push(sql`co.slug = any(${textArray(f.competition)})`);
    if (f.medal) parts.push(sql`aw.medal = any(${textArray(f.medal)})`);
    if (f.awardYear) parts.push(sql`aw.year = ${f.awardYear}`);
    c.push(sql`exists (select 1 from wine_awards aw join competitions co on co.id = aw.competition_id where ${and(parts)})`);
  }
  if (f.exp || f.priceMax !== undefined || f.group || f.durationMax) {
    const parts: Frag[] = [sql`te.winery_id = w.id`, sql`te.is_active`, sql`te.verification::text = any(${supported})`];
    if (f.exp) parts.push(sql`te.kind = any(${textArray(f.exp)})`);
    if (f.priceMax !== undefined) parts.push(sql`te.price_eur is not null and te.price_eur <= ${f.priceMax}`);
    if (f.group) parts.push(sql`te.max_group is not null and te.max_group >= ${f.group} and coalesce(te.min_group, 1) <= ${f.group}`);
    if (f.durationMax) parts.push(sql`te.duration_min is not null and te.duration_min <= ${f.durationMax}`);
    c.push(sql`exists (select 1 from tasting_experiences te where ${and(parts)})`);
  }
  const p = point(f);
  if (p && f.radius) c.push(sql`ST_DWithin(pl.geom, ${p}, ${f.radius * 1000})`);
  if (f.bbox) {
    const [w, s, e, n] = f.bbox;
    c.push(sql`pl.geom::geometry && ST_MakeEnvelope(${w}, ${s}, ${e}, ${n}, 4326)`);
  }
  if (f.featured) c.push(sql`w.is_featured`);
  if (f.slugs) c.push(f.slugs.length ? sql`w.slug = any(${textArray(f.slugs)})` : sql`false`);
  return and(c);
}

export type WineryListItem = {
  id: number;
  slug: string;
  name: string;
  short: LocalizedContent;
  island: string | null;
  is_featured: boolean;
  is_sponsored: boolean;
  verification: string;
  region_slug: string | null;
  region_name: LocalizedText;
  region_color: string | null;
  subregion_name: LocalizedText;
  town: string | null;
  county: string | null;
  precision: string | null;
  lat: number | null;
  lng: number | null;
  distance_km: number | null;
  grapes: { slug: string; name_hr: string; name_en: string }[];
  has_tasting: boolean;
  award_count: number;
  hero_path: string | null;
  logo_path: string | null;
  total: number;
};

function orderBy(f: WineryFilters): Frag {
  const p = point(f);
  const tokens = tokenize(f.q);
  if ((f.sort === "distance" || (!f.sort && p)) && p) return sql`order by pl.geom <-> ${p}, w.name`;
  if (f.sort === "name") return sql`order by atlas_norm(w.name)`;
  if (f.sort === "founded") return sql`order by w.founded_year asc nulls last, atlas_norm(w.name)`;
  if (f.sort === "featured") return sql`order by w.featured_rank asc nulls last, atlas_norm(w.name)`;
  if (tokens.length) {
    const qn = tokens.join(" ");
    return sql`order by (
      case when atlas_norm(w.name) = ${qn} then 100
           when atlas_norm(w.name) like ${qn + "%"} then 60
           when atlas_norm(w.name) like ${"%" + qn + "%"} then 40 else 0 end
      + similarity(atlas_norm(w.name), ${qn}) * 30
      + word_similarity(${qn}, w.search_norm) * 20) desc, atlas_norm(w.name)`;
  }
  return sql`order by atlas_norm(w.name)`;
}

export async function searchWineries(f: WineryFilters, opts: { pageSize?: number } = {}) {
  const pageSize = opts.pageSize ?? PAGE_SIZE;
  const page = f.page ?? 1;
  const p = point(f);
  const supported = textArray(SUPPORTED_STATES as string[]);
  const verified = textArray(VERIFIED_STATES as string[]);
  const rows = await sql<WineryListItem[]>`
    select w.id, w.slug, w.name, w.island, w.is_featured, w.is_sponsored, w.verification,
      jsonb_build_object('hr', jsonb_build_object('short', w.content->'hr'->>'short', 'status', w.content->'hr'->>'status'),
                         'en', jsonb_build_object('short', w.content->'en'->>'short', 'status', w.content->'en'->>'status')) as short,
      r.slug as region_slug, r.name as region_name, r.color as region_color, s.name as subregion_name,
      pl.town, pl.county, pl.precision,
      ST_Y(pl.geom::geometry) as lat, ST_X(pl.geom::geometry) as lng,
      ${p ? sql`round((ST_Distance(pl.geom, ${p}) / 1000)::numeric, 1)::float` : sql`null::float`} as distance_km,
      coalesce((select json_agg(json_build_object('slug', gv.slug, 'name_hr', gv.name_hr, 'name_en', gv.name_en)
                 order by wg.is_signature desc, gv.name_en)
         from (select * from winery_grape_varieties x where x.winery_id = w.id order by x.is_signature desc limit 4) wg
         join grape_varieties gv on gv.id = wg.grape_id), '[]'::json) as grapes,
      (exists (select 1 from winery_facilities wf where wf.winery_id = w.id and wf.facility = 'tasting' and wf.verification::text = any(${supported}))
        or exists (select 1 from tasting_experiences te where te.winery_id = w.id and te.is_active
          and te.kind in ('tasting','cellar_tour','food_pairing') and te.verification::text = any(${supported}))) as has_tasting,
      (select count(*)::int from wine_awards aw where aw.winery_id = w.id and aw.verification::text = any(${verified})) as award_count,
      (select m.storage_path from media m where m.id = w.hero_media_id and m.status = 'approved') as hero_path,
      (select m.storage_path from media m where m.id = w.logo_media_id and m.status = 'approved') as logo_path,
      count(*) over()::int as total
    from wineries w
    left join winery_locations pl on pl.winery_id = w.id and pl.is_primary
    left join wine_regions r on r.id = w.region_id
    left join wine_subregions s on s.id = w.subregion_id
    where ${wineryWhere(f)}
    ${orderBy(f)}
    limit ${pageSize} offset ${(page - 1) * pageSize}`;
  return { items: rows, total: rows[0]?.total ?? (page > 1 ? await countWineries(f) : 0), page, pageSize };
}

export async function countWineries(f: WineryFilters) {
  const [{ count }] = await sql<{ count: number }[]>`
    select count(*)::int as count from wineries w
    left join winery_locations pl on pl.winery_id = w.id and pl.is_primary
    where ${wineryWhere(f)}`;
  return count;
}

export type Marker = { id: number; slug: string; name: string; lat: number; lng: number; color: string; region: string | null; town: string | null; precision: string };

/** Lightweight marker payload for the map; viewport-limited when a bbox is given. */
export async function wineryMarkers(f: WineryFilters, limit = 5000): Promise<Marker[]> {
  return sql<Marker[]>`
    select w.id, w.slug, w.name, ST_Y(pl.geom::geometry) as lat, ST_X(pl.geom::geometry) as lng,
      coalesce(r.color, '#193C34') as color, r.slug as region, pl.town, pl.precision
    from wineries w
    join winery_locations pl on pl.winery_id = w.id and pl.is_primary and pl.geom is not null
    left join wine_regions r on r.id = w.region_id
    where ${wineryWhere(f)}
    limit ${limit}`;
}

export async function featuredWineries(limit = 6) {
  const { items } = await searchWineries({ featured: true, sort: "featured" }, { pageSize: limit });
  return items;
}

export async function wineriesByIds(ids: number[]) {
  if (!ids.length) return [];
  return sql<{ id: number; slug: string; name: string; town: string | null; lat: number; lng: number; region_color: string | null; precision: string }[]>`
    select w.id, w.slug, w.name, pl.town, ST_Y(pl.geom::geometry) as lat, ST_X(pl.geom::geometry) as lng,
      r.color as region_color, pl.precision
    from wineries w
    left join winery_locations pl on pl.winery_id = w.id and pl.is_primary
    left join wine_regions r on r.id = w.region_id
    where w.id = any(${intArray(ids)}) and w.status = 'published'`;
}

export async function wineriesBySlugs(slugs: string[]) {
  if (!slugs.length) return [];
  const rows = await sql<{ id: number; slug: string }[]>`select id, slug from wineries where slug = any(${textArray(slugs)}) and status = 'published'`;
  const ids = rows.map((r) => r.id);
  const items = await wineriesByIds(ids);
  return slugs.map((s) => items.find((i) => i.slug === s)).filter(Boolean) as Awaited<ReturnType<typeof wineriesByIds>>;
}
