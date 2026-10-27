import "server-only";
import { cache } from "react";
import { sql, textArray } from "../db";
import { tokenize } from "../norm";
import { VERIFIED_STATES } from "../constants";
import type { LocalizedContent, LocalizedText } from "../content";

const verifiedArr = () => textArray(VERIFIED_STATES as string[]);

// ───────────────────────────── Geography ─────────────────────────────

export type RegionRow = {
  id: number; slug: string; official_name: string; name: LocalizedText; content: LocalizedContent; color: string; sort: number;
  winery_count: number; has_geom: boolean; verification: string; source_name: string | null; source_url: string | null;
};

export const getRegions = cache(async () => sql<RegionRow[]>`
  select r.id, r.slug, r.official_name, r.name, r.content, r.color, r.sort, r.verification, r.geom is not null as has_geom,
    (select count(*)::int from wineries w where w.region_id = r.id and w.status = 'published') as winery_count,
    ds.name as source_name, ds.url as source_url
  from wine_regions r left join data_sources ds on ds.id = r.source_id
  order by r.sort`);

export const getRegion = cache(async (slug: string) => {
  const [r] = await sql<RegionRow[]>`
    select r.id, r.slug, r.official_name, r.name, r.content, r.color, r.sort, r.verification, r.geom is not null as has_geom,
      (select count(*)::int from wineries w where w.region_id = r.id and w.status = 'published') as winery_count,
      ds.name as source_name, ds.url as source_url
    from wine_regions r left join data_sources ds on ds.id = r.source_id where r.slug = ${slug}`;
  return r ?? null;
});

export type SubregionRow = {
  id: number; slug: string; official_name: string; name: LocalizedText; content: LocalizedContent; region_slug: string;
  winery_count: number; verification: string;
};

export async function getSubregions(regionId?: number) {
  return sql<SubregionRow[]>`
    select s.id, s.slug, s.official_name, s.name, s.content, s.verification, r.slug as region_slug,
      (select count(*)::int from wineries w where w.subregion_id = s.id and w.status = 'published') as winery_count
    from wine_subregions s join wine_regions r on r.id = s.region_id
    ${regionId ? sql`where s.region_id = ${regionId}` : sql``}
    order by r.sort, s.sort`;
}

export const getSubregion = cache(async (slug: string) => {
  const [s] = await sql<(SubregionRow & { region_id: number; region_name: LocalizedText; region_color: string })[]>`
    select s.id, s.slug, s.official_name, s.name, s.content, s.verification, s.region_id,
      r.slug as region_slug, r.name as region_name, r.color as region_color,
      (select count(*)::int from wineries w where w.subregion_id = s.id and w.status = 'published') as winery_count
    from wine_subregions s join wine_regions r on r.id = s.region_id where s.slug = ${slug}`;
  return s ?? null;
});

export type DistrictRow = {
  id: number; slug: string; official_name: string; name: LocalizedText; content: LocalizedContent; verification: string;
  subregion_slug: string; subregion_name: LocalizedText; region_slug: string; region_name: LocalizedText; region_color: string; winery_count: number;
};

export async function getDistricts(subregionId?: number) {
  return sql<DistrictRow[]>`
    select d.id, d.slug, d.official_name, d.name, d.content, d.verification,
      s.slug as subregion_slug, s.name as subregion_name, r.slug as region_slug, r.name as region_name, r.color as region_color,
      (select count(*)::int from wineries w where w.district_id = d.id and w.status = 'published') as winery_count
    from wine_districts d join wine_subregions s on s.id = d.subregion_id join wine_regions r on r.id = s.region_id
    ${subregionId ? sql`where d.subregion_id = ${subregionId}` : sql``}
    order by d.official_name`;
}

export const getDistrict = cache(async (slug: string) => {
  const rows = await sql<DistrictRow[]>`
    select d.id, d.slug, d.official_name, d.name, d.content, d.verification,
      s.slug as subregion_slug, s.name as subregion_name, r.slug as region_slug, r.name as region_name, r.color as region_color,
      (select count(*)::int from wineries w where w.district_id = d.id and w.status = 'published') as winery_count
    from wine_districts d join wine_subregions s on s.id = d.subregion_id join wine_regions r on r.id = s.region_id
    where d.slug = ${slug}`;
  return rows[0] ?? null;
});

export type SiteRow = {
  id: number; slug: string; official_name: string; name: LocalizedText; content: LocalizedContent; verification: string;
  district_slug: string | null; district_name: LocalizedText; subregion_slug: string | null; subregion_name: LocalizedText;
  region_slug: string | null; region_name: LocalizedText; region_color: string | null;
};

export const getSite = cache(async (slug: string) => {
  const [s] = await sql<SiteRow[]>`
    select v.id, v.slug, v.official_name, v.name, v.content, v.verification,
      d.slug as district_slug, d.name as district_name, s.slug as subregion_slug, s.name as subregion_name,
      r.slug as region_slug, r.name as region_name, r.color as region_color
    from vineyard_sites v
    left join wine_districts d on d.id = v.district_id
    left join wine_subregions s on s.id = d.subregion_id
    left join wine_regions r on r.id = s.region_id
    where v.slug = ${slug}`;
  return s ?? null;
});

export async function getSites() {
  return sql<{ slug: string; name: LocalizedText; district_slug: string | null; region_slug: string | null; wine_count: number }[]>`
    select v.slug, v.name, d.slug as district_slug, r.slug as region_slug,
      (select count(*)::int from wines wi where wi.vineyard_site_id = v.id and wi.status = 'published') as wine_count
    from vineyard_sites v
    left join wine_districts d on d.id = v.district_id
    left join wine_subregions s on s.id = d.subregion_id
    left join wine_regions r on r.id = s.region_id order by v.official_name`;
}

export async function getIslands() {
  return sql<{ island: string; slug: string; count: number }[]>`
    select island, regexp_replace(atlas_norm(island), '[^a-z0-9]+', '-', 'g') as slug, count(*)::int
    from wineries where island is not null and status = 'published' group by island order by island`;
}

// ───────────────────────────── Grapes ─────────────────────────────

export type GrapeRow = {
  id: number; slug: string; name_hr: string; name_en: string; synonyms: string[]; berry_color: string; origin: string;
  parentage: string | null; vivc_number: number | null; content: LocalizedContent; acidity: number | null; tannin: number | null;
  is_featured: boolean; verification: string; winery_count: number; wine_count: number; regions: { slug: string; name: LocalizedText; color: string }[];
};

const grapeSelect = sql`
  select g.id, g.slug, g.name_hr, g.name_en, g.synonyms, g.berry_color, g.origin, g.parentage, g.vivc_number, g.content,
    g.acidity, g.tannin, g.is_featured, g.verification,
    (select count(distinct w.id)::int from wineries w where w.status = 'published' and (
        exists (select 1 from winery_grape_varieties wg where wg.winery_id = w.id and wg.grape_id = g.id)
        or exists (select 1 from wines wi join wine_grape_compositions c on c.wine_id = wi.id where wi.winery_id = w.id and c.grape_id = g.id))) as winery_count,
    (select count(distinct c.wine_id)::int from wine_grape_compositions c join wines wi on wi.id = c.wine_id and wi.status = 'published' where c.grape_id = g.id) as wine_count,
    coalesce((select json_agg(json_build_object('slug', r.slug, 'name', r.name, 'color', r.color) order by r.sort)
      from grape_regions gr join wine_regions r on r.id = gr.region_id where gr.grape_id = g.id), '[]') as regions
  from grape_varieties g`;

export async function getGrapes(opts: { q?: string; color?: string; origin?: string; featured?: boolean } = {}) {
  const tokens = tokenize(opts.q);
  const conds = [sql`true`];
  for (const t of tokens) conds.push(sql`(g.search_norm like ${"%" + t + "%"} or word_similarity(${t}, g.search_norm) >= 0.6)`);
  if (opts.color) conds.push(sql`g.berry_color = ${opts.color}`);
  if (opts.origin) conds.push(sql`g.origin = ${opts.origin}`);
  if (opts.featured) conds.push(sql`g.is_featured`);
  const where = conds.reduce((a, b) => sql`${a} and ${b}`);
  return sql<GrapeRow[]>`${grapeSelect} where ${where}
    order by (g.origin = 'indigenous') desc, g.is_featured desc, atlas_norm(g.name_hr)`;
}

export const getGrape = cache(async (slug: string) => {
  const [g] = await sql<GrapeRow[]>`${grapeSelect} where g.slug = ${slug}`;
  return g ?? null;
});

// ───────────────────────────── Wines ─────────────────────────────

export type WineListItem = {
  id: number; slug: string; name: string; type: string; styles: string[]; winery_slug: string; winery_name: string;
  region_slug: string | null; region_color: string | null; town: string | null;
  grapes: { slug: string; name_hr: string; name_en: string }[]; site_name: LocalizedText; award_count: number; total: number;
};

export async function searchWines(f: { q?: string; type?: string[]; grape?: string[]; region?: string[]; site?: string; awarded?: boolean; page?: number }, pageSize = 30) {
  const conds = [sql`wi.status = 'published'`, sql`w.status = 'published'`];
  for (const t of tokenize(f.q)) conds.push(sql`(wi.search_norm like ${"%" + t + "%"} or word_similarity(${t}, wi.search_norm) >= 0.55)`);
  if (f.type?.length) conds.push(sql`wi.type::text = any(${textArray(f.type)})`);
  if (f.grape?.length) conds.push(sql`exists (select 1 from wine_grape_compositions c join grape_varieties g on g.id = c.grape_id where c.wine_id = wi.id and g.slug = any(${textArray(f.grape)}))`);
  if (f.region?.length) conds.push(sql`r.slug = any(${textArray(f.region)})`);
  if (f.site) conds.push(sql`vs.slug = ${f.site}`);
  if (f.awarded) conds.push(sql`exists (select 1 from wine_awards aw where aw.wine_id = wi.id and aw.verification::text = any(${verifiedArr()}))`);
  const where = conds.reduce((a, b) => sql`${a} and ${b}`);
  const page = f.page ?? 1;
  const items = await sql<WineListItem[]>`
    select wi.id, wi.slug, wi.name, wi.type, wi.styles, w.slug as winery_slug, w.name as winery_name,
      r.slug as region_slug, r.color as region_color, pl.town, vs.name as site_name,
      coalesce((select json_agg(json_build_object('slug', g.slug, 'name_hr', g.name_hr, 'name_en', g.name_en))
        from wine_grape_compositions c join grape_varieties g on g.id = c.grape_id where c.wine_id = wi.id and c.vintage_id is null), '[]') as grapes,
      (select count(*)::int from wine_awards aw where aw.wine_id = wi.id and aw.verification::text = any(${verifiedArr()})) as award_count,
      count(*) over()::int as total
    from wines wi
    join wineries w on w.id = wi.winery_id
    left join wine_regions r on r.id = w.region_id
    left join winery_locations pl on pl.winery_id = w.id and pl.is_primary
    left join vineyard_sites vs on vs.id = wi.vineyard_site_id
    where ${where}
    order by atlas_norm(w.name), atlas_norm(wi.name)
    limit ${pageSize} offset ${(page - 1) * pageSize}`;
  return { items, total: items[0]?.total ?? 0, page, pageSize };
}

export type WineDetail = {
  id: number; slug: string; name: string; type: string; styles: string[]; content: LocalizedContent;
  serving_temp: string | null; aging_potential: string | null; bottle_formats: string[]; purchase_url: string | null;
  verification: string; updated_at: string;
  winery: { id: number; slug: string; name: string; town: string | null };
  region: { slug: string; name: LocalizedText; color: string } | null;
  site: { slug: string; name: LocalizedText } | null; appellation: { slug: string; name: LocalizedText } | null;
  source: { name: string; url: string | null; kind: string } | null;
  bottle_path: string | null;
};

export const getWine = cache(async (slug: string) => {
  const [wi] = await sql<WineDetail[]>`
    select wi.id, wi.slug, wi.name, wi.type, wi.styles, wi.content, wi.serving_temp, wi.aging_potential, wi.bottle_formats,
      wi.purchase_url, wi.verification, wi.updated_at,
      json_build_object('id', w.id, 'slug', w.slug, 'name', w.name, 'town', pl.town) as winery,
      case when r.id is null then null else json_build_object('slug', r.slug, 'name', r.name, 'color', r.color) end as region,
      case when vs.id is null then null else json_build_object('slug', vs.slug, 'name', vs.name) end as site,
      case when a.id is null then null else json_build_object('slug', a.slug, 'name', a.name) end as appellation,
      case when ds.id is null then null else json_build_object('name', ds.name, 'url', ds.url, 'kind', ds.kind) end as source,
      (select m.storage_path from media m where m.id = wi.bottle_media_id and m.status = 'approved') as bottle_path
    from wines wi join wineries w on w.id = wi.winery_id and w.status = 'published'
    left join winery_locations pl on pl.winery_id = w.id and pl.is_primary
    left join wine_regions r on r.id = w.region_id
    left join vineyard_sites vs on vs.id = wi.vineyard_site_id
    left join appellations a on a.id = wi.appellation_id
    left join data_sources ds on ds.id = wi.source_id
    where wi.slug = ${slug} and wi.status = 'published'`;
  if (!wi) return null;
  const [grapes, vintages, awards] = await Promise.all([
    sql<{ slug: string; name_hr: string; name_en: string; percentage: string | null; vintage_year: number | null }[]>`
      select g.slug, g.name_hr, g.name_en, c.percentage, v.year as vintage_year
      from wine_grape_compositions c join grape_varieties g on g.id = c.grape_id left join wine_vintages v on v.id = c.vintage_id
      where c.wine_id = ${wi.id} order by v.year desc nulls first, c.percentage desc nulls last`,
    sql<{ id: number; year: number | null; alcohol_pct: string | null; residual_sugar_gl: string | null; total_acidity_gl: string | null; barrel: string | null; price_eur: string | null; tech_sheet_path: string | null; verification: string }[]>`
      select v.id, v.year, v.alcohol_pct, v.residual_sugar_gl, v.total_acidity_gl, v.barrel, v.price_eur, v.verification,
        (select m.storage_path from media m where m.id = v.tech_sheet_media_id and m.status = 'approved') as tech_sheet_path
      from wine_vintages v where v.wine_id = ${wi.id} order by v.year desc nulls last`,
    sql<{ id: number; year: number; medal: string; medal_label: string | null; score: string | null; source_url: string | null; vintage_year: number | null; competition_name: string; competition_slug: string; verification: string; verified_at: string | null }[]>`
      select aw.id, aw.year, aw.medal, aw.medal_label, aw.score, aw.source_url, aw.verification, aw.verified_at,
        coalesce(v.year, aw.vintage_year) as vintage_year, c.name as competition_name, c.slug as competition_slug
      from wine_awards aw join competitions c on c.id = aw.competition_id left join wine_vintages v on v.id = aw.vintage_id
      where aw.wine_id = ${wi.id} and aw.verification::text = any(${verifiedArr()}) order by aw.year desc`,
  ]);
  return { ...wi, grapes, vintages, awards };
});

// ───────────────────────────── Awards ─────────────────────────────

export type AwardRow = {
  id: number; year: number; medal: string; medal_label: string | null; score: string | null; source_url: string | null;
  verified_at: string | null; vintage_year: number | null; competition_slug: string; competition_name: string;
  wine_slug: string; wine_name: string; winery_slug: string; winery_name: string; region_color: string | null; total: number;
};

export async function searchAwards(f: { competition?: string[]; medal?: string[]; year?: number; q?: string; region?: string[]; page?: number }, pageSize = 40) {
  const conds = [sql`aw.verification::text = any(${verifiedArr()})`, sql`w.status = 'published'`];
  if (f.competition?.length) conds.push(sql`c.slug = any(${textArray(f.competition)})`);
  if (f.medal?.length) conds.push(sql`aw.medal = any(${textArray(f.medal)})`);
  if (f.year) conds.push(sql`aw.year = ${f.year}`);
  if (f.region?.length) conds.push(sql`r.slug = any(${textArray(f.region)})`);
  for (const t of tokenize(f.q)) conds.push(sql`(atlas_norm(w.name || ' ' || wi.name) like ${"%" + t + "%"})`);
  const where = conds.reduce((a, b) => sql`${a} and ${b}`);
  const page = f.page ?? 1;
  const items = await sql<AwardRow[]>`
    select aw.id, aw.year, aw.medal, aw.medal_label, aw.score, aw.source_url, aw.verified_at,
      coalesce(v.year, aw.vintage_year) as vintage_year, c.slug as competition_slug, c.name as competition_name,
      wi.slug as wine_slug, wi.name as wine_name, w.slug as winery_slug, w.name as winery_name, r.color as region_color,
      count(*) over()::int as total
    from wine_awards aw join competitions c on c.id = aw.competition_id
    join wines wi on wi.id = aw.wine_id join wineries w on w.id = aw.winery_id
    left join wine_vintages v on v.id = aw.vintage_id
    left join wine_regions r on r.id = w.region_id
    where ${where}
    order by aw.year desc, c.sort, w.name
    limit ${pageSize} offset ${(page - 1) * pageSize}`;
  return { items, total: items[0]?.total ?? 0, page, pageSize };
}

export async function getCompetitions() {
  return sql<{ id: number; slug: string; name: string; short_name: string | null; website: string | null; scope: string; award_count: number }[]>`
    select c.id, c.slug, c.name, c.short_name, c.website, c.scope,
      (select count(*)::int from wine_awards aw where aw.competition_id = c.id and aw.verification::text = any(${verifiedArr()})) as award_count
    from competitions c order by c.sort, c.name`;
}

// ───────────────────────────── Experiences ─────────────────────────────

export async function searchExperiences(f: { kind?: string[]; region?: string[] }) {
  const conds = [sql`te.is_active`, sql`w.status = 'published'`, sql`te.verification <> 'unverified'`];
  if (f.kind?.length) conds.push(sql`te.kind = any(${textArray(f.kind)})`);
  if (f.region?.length) conds.push(sql`r.slug = any(${textArray(f.region)})`);
  const where = conds.reduce((a, b) => sql`${a} and ${b}`);
  return sql<{ id: number; kind: string; name: LocalizedText; description: LocalizedText; duration_min: number | null; price_eur: string | null; max_group: number | null; languages: string[]; verification: string; winery_slug: string; winery_name: string; town: string | null; region_slug: string | null; region_name: LocalizedText; region_color: string | null; source_name: string | null; source_url: string | null }[]>`
    select te.id, te.kind, te.name, te.description, te.duration_min, te.price_eur, te.max_group, te.languages, te.verification,
      w.slug as winery_slug, w.name as winery_name, pl.town, r.slug as region_slug, r.name as region_name, r.color as region_color,
      ds.name as source_name, ds.url as source_url
    from tasting_experiences te join wineries w on w.id = te.winery_id
    left join winery_locations pl on pl.winery_id = w.id and pl.is_primary
    left join wine_regions r on r.id = w.region_id
    left join data_sources ds on ds.id = te.source_id
    where ${where} order by r.sort, w.name, te.sort`;
}

// ───────────────────────────── Routes ─────────────────────────────

export type RouteStop = { position: number; day: number; winery_id: number; slug: string; name: string; town: string | null; lat: number; lng: number; region_color: string | null; precision: string };

export async function getEditorialRoutes() {
  return sql<{ id: string; slug: string; title: LocalizedText; description: LocalizedText; stop_count: number; region_colors: string[] }[]>`
    select rt.id, rt.slug, rt.title, rt.description,
      (select count(*)::int from wine_route_stops s where s.route_id = rt.id) as stop_count,
      (select array_agg(distinct r.color) from wine_route_stops s join wineries w on w.id = s.winery_id join wine_regions r on r.id = w.region_id where s.route_id = rt.id) as region_colors
    from wine_routes rt where rt.is_editorial and rt.is_public order by rt.created_at`;
}

export async function getRouteStops(routeId: string) {
  return sql<RouteStop[]>`
    select s.position, s.day, w.id as winery_id, w.slug, w.name, pl.town, ST_Y(pl.geom::geometry) as lat, ST_X(pl.geom::geometry) as lng,
      r.color as region_color, pl.precision
    from wine_route_stops s join wineries w on w.id = s.winery_id and w.status = 'published'
    left join winery_locations pl on pl.winery_id = w.id and pl.is_primary
    left join wine_regions r on r.id = w.region_id
    where s.route_id = ${routeId} order by s.day, s.position`;
}

export const getRouteBySlug = cache(async (slug: string) => {
  const [r] = await sql<{ id: string; slug: string; title: LocalizedText; description: LocalizedText; is_editorial: boolean; is_public: boolean; user_id: string | null }[]>`
    select id, slug, title, description, is_editorial, is_public, user_id from wine_routes where slug = ${slug}`;
  return r ?? null;
});

// ───────────────────────────── Articles ─────────────────────────────

export type ArticleRow = {
  id: number; slug: string; category: string; status: string; content: LocalizedContent; author_name: string | null;
  sources: { label: string; url: string }[]; related: { wineries?: string[]; grapes?: string[]; regions?: string[]; sites?: string[] };
  published_at: string | null; updated_at: string; reviewed_at: string | null; hero_path: string | null;
};

export async function getArticles(opts: { category?: string; limit?: number; related?: { key: string; slug: string } } = {}) {
  const conds = [sql`a.status = 'published'`];
  if (opts.category) conds.push(sql`a.category = ${opts.category}`);
  if (opts.related) conds.push(sql`a.related -> ${opts.related.key} ? ${opts.related.slug}`);
  const where = conds.reduce((x, y) => sql`${x} and ${y}`);
  return sql<ArticleRow[]>`
    select a.*, (select m.storage_path from media m where m.id = a.hero_media_id and m.status = 'approved') as hero_path
    from editorial_articles a where ${where}
    order by a.published_at desc nulls last limit ${opts.limit ?? 50}`;
}

export const getArticle = cache(async (slug: string) => {
  const [a] = await sql<ArticleRow[]>`
    select a.*, (select m.storage_path from media m where m.id = a.hero_media_id and m.status = 'approved') as hero_path
    from editorial_articles a where a.slug = ${slug} and a.status = 'published'`;
  return a ?? null;
});

// ───────────────────────────── Global search ─────────────────────────────

export type Suggestion = { kind: "winery" | "region" | "subregion" | "district" | "site" | "grape" | "wine" | "town"; slug: string; label: string; sub?: string; color?: string | null; labelHr?: string; labelEn?: string; parent?: string };

export async function suggest(q: string, limit = 5): Promise<Suggestion[]> {
  const tokens = tokenize(q);
  if (!tokens.length) return [];
  const qn = tokens.join(" ");
  const like = "%" + qn + "%";
  const [wineries, regions, grapes, wines, towns, sites] = await Promise.all([
    sql<{ slug: string; name: string; town: string | null; color: string | null }[]>`
      select w.slug, w.name, pl.town, r.color from wineries w
      left join winery_locations pl on pl.winery_id = w.id and pl.is_primary
      left join wine_regions r on r.id = w.region_id
      where w.status = 'published' and (atlas_norm(w.name || ' ' || array_to_string(w.alt_names, ' ')) like ${like}
        or word_similarity(${qn}, atlas_norm(w.name)) >= 0.5)
      order by (atlas_norm(w.name) like ${qn + "%"}) desc, similarity(atlas_norm(w.name), ${qn}) desc limit ${limit}`,
    sql<{ kind: string; slug: string; hr: string; en: string; color: string | null; parent: string | null }[]>`
      select * from (
        select 'region' as kind, slug, name->>'hr' as hr, name->>'en' as en, color, null::text as parent from wine_regions
        union all select 'subregion', s.slug, s.name->>'hr', s.name->>'en', r.color, r.slug from wine_subregions s join wine_regions r on r.id = s.region_id
        union all select 'district', d.slug, d.name->>'hr', d.name->>'en', r.color, null from wine_districts d join wine_subregions s on s.id = d.subregion_id join wine_regions r on r.id = s.region_id
      ) x where atlas_norm(hr || ' ' || en) like ${like} or word_similarity(${qn}, atlas_norm(hr || ' ' || en)) >= 0.6
      limit ${limit}`,
    sql<{ slug: string; name_hr: string; name_en: string }[]>`
      select slug, name_hr, name_en from grape_varieties
      where search_norm like ${like} or word_similarity(${qn}, search_norm) >= 0.6
      order by (atlas_norm(name_hr) like ${qn + "%"}) desc, is_featured desc limit ${limit}`,
    sql<{ slug: string; name: string; winery: string }[]>`
      select wi.slug, wi.name, w.name as winery from wines wi join wineries w on w.id = wi.winery_id and w.status = 'published'
      where wi.status = 'published' and (atlas_norm(wi.name) like ${like} or word_similarity(${qn}, atlas_norm(wi.name)) >= 0.6)
      order by atlas_norm(wi.name) limit ${limit}`,
    sql<{ town: string; county: string | null; count: number }[]>`
      select l.town, min(l.county) as county, count(distinct l.winery_id)::int from winery_locations l
      join wineries w on w.id = l.winery_id and w.status = 'published'
      where atlas_norm(l.town) like ${qn + "%"} or atlas_norm(l.municipality) like ${qn + "%"}
      group by l.town order by count(*) desc limit ${limit}`,
    sql<{ slug: string; hr: string; en: string }[]>`
      select slug, name->>'hr' as hr, name->>'en' as en from vineyard_sites where atlas_norm(official_name) like ${like} limit ${limit}`,
  ]);
  return [
    ...regions.map((r) => ({ kind: r.kind as Suggestion["kind"], slug: r.slug, label: r.hr, labelHr: r.hr, labelEn: r.en, color: r.color, parent: r.parent ?? undefined })),
    ...sites.map((s) => ({ kind: "site" as const, slug: s.slug, label: s.hr, labelHr: s.hr, labelEn: s.en })),
    ...wineries.map((w) => ({ kind: "winery" as const, slug: w.slug, label: w.name, sub: w.town ?? undefined, color: w.color })),
    ...grapes.map((g) => ({ kind: "grape" as const, slug: g.slug, label: g.name_hr, labelHr: g.name_hr, labelEn: g.name_en })),
    ...wines.map((w) => ({ kind: "wine" as const, slug: w.slug, label: w.name, sub: w.winery })),
    ...towns.map((t) => ({ kind: "town" as const, slug: t.town, label: t.town, sub: t.county ?? undefined })),
  ];
}

export async function coverage() {
  return sql<{ slug: string; name: LocalizedText; color: string; wineries: number; with_website: number; with_exact_location: number; with_wines: number; verified: number }[]>`
    select r.slug, r.name, r.color,
      count(w.id)::int as wineries,
      count(w.id) filter (where w.website is not null)::int as with_website,
      count(w.id) filter (where exists (select 1 from winery_locations l where l.winery_id = w.id and l.is_primary and l.precision in ('exact','address')))::int as with_exact_location,
      count(w.id) filter (where exists (select 1 from wines wi where wi.winery_id = w.id))::int as with_wines,
      count(w.id) filter (where w.verification in ('editor_verified','officially_verified','owner_submitted'))::int as verified
    from wine_regions r left join wineries w on w.region_id = r.id and w.status = 'published'
    group by r.id order by r.sort`;
}
