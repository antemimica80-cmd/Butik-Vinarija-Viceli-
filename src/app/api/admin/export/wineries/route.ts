import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

/** CSV export in the same column format as the import template (staff only). */
export async function GET() {
  if (!isStaff(await getCurrentUser())) return new NextResponse("Forbidden", { status: 403 });
  const rows = await sql<Record<string, string | number | null>[]>`
    select w.name, w.slug, r.slug as region, s.slug as subregion, d.slug as district, w.island, l.town, l.municipality, l.county, l.address, l.postal_code,
      round(ST_Y(l.geom::geometry)::numeric, 6) as lat, round(ST_X(l.geom::geometry)::numeric, 6) as lng, l.precision, w.website, w.email, w.phone, w.founded_year,
      case when w.family_run then 'yes' when w.family_run = false then 'no' else '' end as family_run, w.size_category,
      (select string_agg(g.slug, ';') from winery_grape_varieties wg join grape_varieties g on g.id = wg.grape_id where wg.winery_id = w.id) as grapes,
      (select string_agg(g.slug, ';') from winery_grape_varieties wg join grape_varieties g on g.id = wg.grape_id where wg.winery_id = w.id and wg.is_signature) as signature_grapes,
      w.content->'hr'->>'short' as short_hr, w.content->'en'->>'short' as short_en,
      (select ds.name from data_sources ds where ds.id = l.source_id) as source_name, (select ds.url from data_sources ds where ds.id = l.source_id) as source_url,
      w.verification, w.status
    from wineries w left join wine_regions r on r.id = w.region_id left join wine_subregions s on s.id = w.subregion_id
    left join wine_districts d on d.id = w.district_id left join winery_locations l on l.winery_id = w.id and l.is_primary
    order by w.name`;
  const cols = ["name", "slug", "region", "subregion", "district", "island", "town", "municipality", "county", "address", "postal_code", "lat", "lng", "precision", "website", "email", "phone", "founded_year", "family_run", "size_category", "grapes", "signature_grapes", "short_hr", "short_en", "source_name", "source_url", "verification", "status"];
  const csv = toCsv([cols, ...rows.map((r) => cols.map((c) => r[c] as string))]);
  return new NextResponse("﻿" + csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="wineries-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
