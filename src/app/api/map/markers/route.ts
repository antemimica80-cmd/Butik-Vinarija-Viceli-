import { NextResponse, type NextRequest } from "next/server";
import { parseFilters } from "@/lib/filters";
import { wineryMarkers } from "@/lib/queries/wineries";

/**
 * GeoJSON markers for the map. `view` (w,s,e,n) limits markers to the current viewport so the
 * browser never downloads the whole dataset; `bbox` is the user's "search this area" filter.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const f = parseFilters(sp);
  const view = sp.get("view")?.split(",").map(Number);
  if (view && view.length === 4 && view.every(Number.isFinite) && !f.bbox) {
    f.bbox = [Math.max(view[0], -180), Math.max(view[1], -85), Math.min(view[2], 180), Math.min(view[3], 85)];
  }
  delete f.page;
  const markers = await wineryMarkers(f);
  return NextResponse.json(
    {
      type: "FeatureCollection",
      features: markers.map((m) => ({
        type: "Feature",
        id: m.id,
        geometry: { type: "Point", coordinates: [m.lng, m.lat] },
        properties: { id: m.id, slug: m.slug, name: m.name, color: m.color, region: m.region, town: m.town, precision: m.precision },
      })),
    },
    { headers: { "Cache-Control": "public, max-age=30, s-maxage=60" } },
  );
}
