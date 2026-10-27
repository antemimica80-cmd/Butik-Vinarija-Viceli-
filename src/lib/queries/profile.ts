import "server-only";
import { cache } from "react";
import { sql, textArray } from "../db";
import { SUPPORTED_STATES, VERIFIED_STATES } from "../constants";
import type { LocalizedContent, LocalizedText } from "../content";

export type Source = { id: number; name: string; url: string | null; kind: string; accessed_at: string | null };

export type WineryProfile = {
  id: number; slug: string; name: string; legal_name: string | null; alt_names: string[]; status: string;
  size_category: string | null; family_run: boolean | null; estate_grown: boolean | null;
  founded_year: number | null; founder: string | null; owner_name: string | null; winemaker_name: string | null; generation: number | null;
  content: LocalizedContent;
  website: string | null; email: string | null; phone: string | null; whatsapp: string | null;
  instagram: string | null; facebook: string | null; youtube: string | null;
  opening_hours: { hr?: string; en?: string } | null; appointment_only: boolean | null; languages: string[];
  island: string | null; is_featured: boolean; is_sponsored: boolean;
  verification: string; verified_at: string | null; updated_at: string;
  region: { id: number; slug: string; name: LocalizedText; color: string } | null;
  subregion: { id: number; slug: string; name: LocalizedText } | null;
  district: { id: number; slug: string; name: LocalizedText } | null;
  hero_path: string | null; logo_path: string | null;
};

export type ProfileLocation = {
  id: number; kind: string; label: LocalizedText; address: string | null; postal_code: string | null;
  town: string | null; municipality: string | null; county: string | null;
  lat: number | null; lng: number | null; precision: string; is_primary: boolean; verification: string; source_id: number | null;
};

export type ProfileWine = {
  id: number; slug: string; name: string; type: string; styles: string[]; content: LocalizedContent;
  site: { slug: string; name: LocalizedText } | null; appellation: { slug: string; name: LocalizedText } | null;
  grapes: { slug: string; name_hr: string; name_en: string; percentage: number | null }[];
  vintages: { id: number; year: number | null; alcohol_pct: string | null }[];
  bottle_path: string | null; verification: string; award_count: number;
};

export type ProfileAward = {
  id: number; year: number; medal: string; medal_label: string | null; score: string | null; category: string | null;
  source_url: string | null; verification: string; verified_at: string | null;
  competition: { slug: string; name: string; short_name: string | null };
  wine: { slug: string; name: string }; vintage_year: number | null;
};

export type Experience = {
  id: number; kind: string; name: LocalizedText; description: LocalizedText; wines_included: number | null;
  duration_min: number | null; price_eur: string | null; price_note: LocalizedText; food_included: boolean | null;
  min_group: number | null; max_group: number | null; languages: string[]; appointment_required: boolean | null;
  verification: string; source_id: number | null;
};

export const getWineryBySlug = cache(async (slug: string, opts: { includeDraft?: boolean } = {}) => {
  const [w] = await sql<WineryProfile[]>`
    select w.*,
      case when r.id is null then null else json_build_object('id', r.id, 'slug', r.slug, 'name', r.name, 'color', r.color) end as region,
      case when s.id is null then null else json_build_object('id', s.id, 'slug', s.slug, 'name', s.name) end as subregion,
      case when d.id is null then null else json_build_object('id', d.id, 'slug', d.slug, 'name', d.name) end as district,
      (select m.storage_path from media m where m.id = w.hero_media_id and m.status = 'approved') as hero_path,
      (select m.storage_path from media m where m.id = w.logo_media_id and m.status = 'approved') as logo_path
    from wineries w
    left join wine_regions r on r.id = w.region_id
    left join wine_subregions s on s.id = w.subregion_id
    left join wine_districts d on d.id = w.district_id
    where w.slug = ${slug} and (w.status = 'published' or ${!!opts.includeDraft})`;
  return w ?? null;
});

export async function getWineryDetails(w: WineryProfile) {
  const supported = textArray(SUPPORTED_STATES as string[]);
  const verified = textArray(VERIFIED_STATES as string[]);
  const [locations, grapes, wines, awards, experiences, facilities, certifications, stats, vineyards, media, sources] = await Promise.all([
    sql<ProfileLocation[]>`
      select id, kind, label, address, postal_code, town, municipality, county, precision, is_primary, verification, source_id,
        ST_Y(geom::geometry) as lat, ST_X(geom::geometry) as lng
      from winery_locations where winery_id = ${w.id} order by is_primary desc, id`,
    sql<{ slug: string; name_hr: string; name_en: string; origin: string; berry_color: string; relation: string; is_signature: boolean }[]>`
      select g.slug, g.name_hr, g.name_en, g.origin, g.berry_color, wg.relation, wg.is_signature
      from winery_grape_varieties wg join grape_varieties g on g.id = wg.grape_id
      where wg.winery_id = ${w.id} order by wg.is_signature desc, g.name_hr`,
    sql<ProfileWine[]>`
      select wi.id, wi.slug, wi.name, wi.type, wi.styles, wi.content, wi.verification,
        case when vs.id is null then null else json_build_object('slug', vs.slug, 'name', vs.name) end as site,
        case when a.id is null then null else json_build_object('slug', a.slug, 'name', a.name) end as appellation,
        coalesce((select json_agg(json_build_object('slug', g.slug, 'name_hr', g.name_hr, 'name_en', g.name_en, 'percentage', c.percentage)
            order by c.percentage desc nulls last, g.name_hr)
          from wine_grape_compositions c join grape_varieties g on g.id = c.grape_id where c.wine_id = wi.id and c.vintage_id is null), '[]') as grapes,
        coalesce((select json_agg(json_build_object('id', v.id, 'year', v.year, 'alcohol_pct', v.alcohol_pct) order by v.year desc nulls last)
          from wine_vintages v where v.wine_id = wi.id), '[]') as vintages,
        (select m.storage_path from media m where m.id = wi.bottle_media_id and m.status = 'approved') as bottle_path,
        (select count(*)::int from wine_awards aw where aw.wine_id = wi.id and aw.verification::text = any(${verified})) as award_count
      from wines wi
      left join vineyard_sites vs on vs.id = wi.vineyard_site_id
      left join appellations a on a.id = wi.appellation_id
      where wi.winery_id = ${w.id} and wi.status = 'published'
      order by wi.type, wi.name`,
    sql<ProfileAward[]>`
      select aw.id, aw.year, aw.medal, aw.medal_label, aw.score, aw.category, aw.source_url, aw.verification, aw.verified_at,
        coalesce(v.year, aw.vintage_year) as vintage_year,
        json_build_object('slug', c.slug, 'name', c.name, 'short_name', c.short_name) as competition,
        json_build_object('slug', wi.slug, 'name', wi.name) as wine
      from wine_awards aw
      join competitions c on c.id = aw.competition_id
      join wines wi on wi.id = aw.wine_id
      left join wine_vintages v on v.id = aw.vintage_id
      where aw.winery_id = ${w.id} and aw.verification::text = any(${verified})
      order by aw.year desc, c.sort`,
    sql<Experience[]>`
      select id, kind, name, description, wines_included, duration_min, price_eur, price_note, food_included,
        min_group, max_group, languages, appointment_required, verification, source_id
      from tasting_experiences where winery_id = ${w.id} and is_active and verification::text = any(${supported})
      order by sort, id`,
    sql<{ facility: string; verification: string; source_id: number | null }[]>`
      select facility, verification, source_id from winery_facilities
      where winery_id = ${w.id} and verification::text = any(${supported}) order by facility`,
    sql<{ kind: string; certifier: string | null; valid_until: string | null; source_id: number | null }[]>`
      select kind, certifier, valid_until, source_id from winery_certifications
      where winery_id = ${w.id} and verification::text = any(${verified})
        and (valid_until is null or valid_until >= current_date)`,
    sql<{ metric: string; value: string; reference_year: number | null; verification: string; source_id: number | null; verified_at: string | null }[]>`
      select metric, value, reference_year, verification, source_id, verified_at from winery_stats
      where winery_id = ${w.id} and verification::text = any(${supported})
      order by metric, reference_year desc nulls last`,
    sql<{ id: number; name: string; area_ha: string | null; altitude_m: number | null; aspect: string | null; soil: LocalizedText; training_system: string | null; vine_age_years: number | null; planting_density_per_ha: number | null; reference_year: number | null; source_id: number | null; site_slug: string | null; site_name: LocalizedText }[]>`
      select v.id, v.name, v.area_ha, v.altitude_m, v.aspect, v.soil, v.training_system, v.vine_age_years,
        v.planting_density_per_ha, v.reference_year, v.source_id, vs.slug as site_slug, vs.name as site_name
      from vineyards v left join vineyard_sites vs on vs.id = v.vineyard_site_id
      where v.winery_id = ${w.id} and v.verification::text = any(${supported})`,
    sql<{ id: number; kind: string; storage_path: string; alt: LocalizedText; caption: LocalizedText; credit: string | null; license: string; width: number | null; height: number | null }[]>`
      select id, kind, storage_path, alt, caption, credit, license, width, height from media
      where winery_id = ${w.id} and status = 'approved' and kind in ('gallery','tasting_room','historic','hero')
      order by sort, id`,
    sql<Source[]>`
      select distinct ds.id, ds.name, ds.url, ds.kind, ds.accessed_at from data_sources ds
      where ds.id in (
        select source_id from winery_locations where winery_id = ${w.id}
        union select source_id from winery_grape_varieties where winery_id = ${w.id}
        union select source_id from winery_facilities where winery_id = ${w.id}
        union select source_id from tasting_experiences where winery_id = ${w.id}
        union select source_id from winery_stats where winery_id = ${w.id}
        union select source_id from wines where winery_id = ${w.id}
        union select source_id from vineyards where winery_id = ${w.id}
        union select source_id from winery_certifications where winery_id = ${w.id}
      ) order by ds.name`,
  ]);
  return { locations, grapes, wines, awards, experiences, facilities, certifications, stats, vineyards, media, sources };
}

export async function nearbyWineries(wineryId: number, limit = 4) {
  return sql<{ slug: string; name: string; town: string | null; region_color: string | null; distance_km: number }[]>`
    select w.slug, w.name, l2.town, r.color as region_color,
      round((ST_Distance(l1.geom, l2.geom) / 1000)::numeric, 1)::float as distance_km
    from winery_locations l1
    join winery_locations l2 on l2.is_primary and l2.winery_id <> l1.winery_id
    join wineries w on w.id = l2.winery_id and w.status = 'published'
    left join wine_regions r on r.id = w.region_id
    where l1.winery_id = ${wineryId} and l1.is_primary
    order by l1.geom <-> l2.geom limit ${limit}`;
}

export async function similarWineries(wineryId: number, limit = 4) {
  return sql<{ slug: string; name: string; town: string | null; region_color: string | null; shared: string[] }[]>`
    select w.slug, w.name, pl.town, r.color as region_color, array_agg(g.name_hr order by g.name_hr) as shared
    from winery_grape_varieties mine
    join winery_grape_varieties other on other.grape_id = mine.grape_id and other.winery_id <> mine.winery_id
    join grape_varieties g on g.id = other.grape_id
    join wineries w on w.id = other.winery_id and w.status = 'published'
    left join winery_locations pl on pl.winery_id = w.id and pl.is_primary
    left join wine_regions r on r.id = w.region_id
    where mine.winery_id = ${wineryId} and (mine.is_signature or other.is_signature)
    group by w.slug, w.name, pl.town, r.color
    order by count(*) desc, w.name limit ${limit}`;
}
