import { NextResponse, type NextRequest } from "next/server";
import { wineriesBySlugs } from "@/lib/queries/wineries";

/** Resolve shared route links (?stops=slug,slug) to public winery locations. */
export async function GET(req: NextRequest) {
  const slugs = (req.nextUrl.searchParams.get("slugs") ?? "").split(",").filter((s) => /^[a-z0-9-]{1,80}$/.test(s)).slice(0, 25);
  const items = await wineriesBySlugs(slugs);
  return NextResponse.json({ items });
}
