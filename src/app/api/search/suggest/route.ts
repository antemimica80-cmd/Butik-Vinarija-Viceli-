import { NextResponse, type NextRequest } from "next/server";
import { suggest } from "@/lib/queries/catalog";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 80);
  if (q.trim().length < 2) return NextResponse.json({ items: [] });
  const items = await suggest(q, 5);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
}
