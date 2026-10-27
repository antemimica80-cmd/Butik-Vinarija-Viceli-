import { NextResponse, type NextRequest } from "next/server";
import { parseFilters } from "@/lib/filters";
import { searchWineries } from "@/lib/queries/wineries";

/** Paginated winery search for the explorer. Only public, published data is returned. */
export async function GET(req: NextRequest) {
  const f = parseFilters(req.nextUrl.searchParams);
  const pageSize = Math.min(Number(req.nextUrl.searchParams.get("pageSize")) || 24, 60);
  const result = await searchWineries(f, { pageSize });
  return NextResponse.json(result, { headers: { "Cache-Control": "public, max-age=30, s-maxage=60" } });
}
