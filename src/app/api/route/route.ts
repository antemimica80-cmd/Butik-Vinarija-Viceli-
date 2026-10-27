import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { clientIpHash } from "@/lib/security";

const body = z.object({ coords: z.array(z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])).min(2).max(25) });

/**
 * Driving route between stops via an OSRM-compatible service (ROUTING_OSRM_URL).
 * Without a configured service we return `enabled: false` — the client then shows no travel
 * times rather than an invented straight-line estimate.
 */
export async function POST(req: NextRequest) {
  const base = process.env.ROUTING_OSRM_URL?.replace(/\/$/, "");
  if (!base) return NextResponse.json({ enabled: false });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ enabled: true, error: "invalid" }, { status: 400 });
  if (!(await rateLimit(`route:${await clientIpHash()}`, 60, 3600))) return NextResponse.json({ enabled: true, error: "rate_limit" }, { status: 429 });
  const path = parsed.data.coords.map(([lng, lat]) => `${lng.toFixed(5)},${lat.toFixed(5)}`).join(";");
  try {
    const res = await fetch(`${base}/route/v1/driving/${path}?overview=full&geometries=geojson&steps=false`, { signal: AbortSignal.timeout(8000) });
    const data = (await res.json()) as { code: string; routes?: { geometry: unknown; duration: number; distance: number; legs: { duration: number; distance: number }[] }[] };
    if (data.code !== "Ok" || !data.routes?.[0]) return NextResponse.json({ enabled: true, error: "no_route" });
    const r = data.routes[0];
    return NextResponse.json({ enabled: true, geometry: r.geometry, duration: r.duration, distance: r.distance, legs: r.legs.map((l) => ({ duration: l.duration, distance: l.distance })) });
  } catch {
    return NextResponse.json({ enabled: true, error: "unavailable" });
  }
}
