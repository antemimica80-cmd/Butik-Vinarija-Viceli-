import "server-only";
import { cache } from "react";
import { sql } from "../db";
import type { LocalizedText } from "../content";

export type Facets = {
  regions: { slug: string; name: LocalizedText; color: string; count: number; bbox: [number, number, number, number] | null }[];
  subregions: { slug: string; name: LocalizedText; region_slug: string; count: number }[];
  districts: { slug: string; name: LocalizedText; subregion_slug: string; count: number }[];
  islands: { slug: string; island: string; count: number }[];
  grapes: { slug: string; name_hr: string; name_en: string; origin: string; count: number }[];
  competitions: { slug: string; name: string; short_name: string | null }[];
};

export const getFacets = cache(async (): Promise<Facets> => {
  const [regions, subregions, districts, islands, grapes, competitions] = await Promise.all([
    sql<Facets["regions"]>`
      select r.slug, r.name, r.color,
        (select count(*)::int from wineries w where w.region_id = r.id and w.status = 'published') as count,
        (select case when count(*) = 0 then null else
            json_build_array(min(ST_X(l.geom::geometry)), min(ST_Y(l.geom::geometry)), max(ST_X(l.geom::geometry)), max(ST_Y(l.geom::geometry))) end
          from wineries w join winery_locations l on l.winery_id = w.id and l.is_primary
          where w.region_id = r.id and w.status = 'published') as bbox
      from wine_regions r order by r.sort`,
    sql<Facets["subregions"]>`
      select s.slug, s.name, r.slug as region_slug,
        (select count(*)::int from wineries w where w.subregion_id = s.id and w.status = 'published') as count
      from wine_subregions s join wine_regions r on r.id = s.region_id order by r.sort, s.sort`,
    sql<Facets["districts"]>`
      select d.slug, d.name, s.slug as subregion_slug,
        (select count(*)::int from wineries w where w.district_id = d.id and w.status = 'published') as count
      from wine_districts d join wine_subregions s on s.id = d.subregion_id order by d.official_name`,
    sql<Facets["islands"]>`
      select regexp_replace(atlas_norm(island), '[^a-z0-9]+', '-', 'g') as slug, island, count(*)::int as count
      from wineries where island is not null and status = 'published' group by island order by island`,
    sql<Facets["grapes"]>`
      select g.slug, g.name_hr, g.name_en, g.origin, count(distinct wg.winery_id)::int as count
      from grape_varieties g left join winery_grape_varieties wg on wg.grape_id = g.id
      left join wineries w on w.id = wg.winery_id and w.status = 'published'
      group by g.id order by count(distinct wg.winery_id) desc, g.name_hr`,
    sql<Facets["competitions"]>`select slug, name, short_name from competitions order by sort`,
  ]);
  return { regions, subregions, districts, islands, grapes, competitions };
});
