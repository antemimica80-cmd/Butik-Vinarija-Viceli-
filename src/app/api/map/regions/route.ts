import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

/** Region polygons — only those imported from an authoritative source (see docs/GEOMETRY.md). */
export async function GET() {
  const rows = await sql<{ slug: string; name: { hr: string; en: string }; color: string; geojson: string }[]>`
    select slug, name, color, ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, 0.002), 5) as geojson
    from wine_regions where geom is not null`;
  return NextResponse.json(
    {
      type: "FeatureCollection",
      features: rows.map((r) => ({ type: "Feature", properties: { slug: r.slug, name_hr: r.name.hr, name_en: r.name.en, color: r.color }, geometry: JSON.parse(r.geojson) })),
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
