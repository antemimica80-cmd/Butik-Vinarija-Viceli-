import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { readUpload } from "@/lib/uploads";
import { canManageWinery, getCurrentUser, isStaff } from "@/lib/auth";

/**
 * Serves uploaded media. Approved public media is cacheable; pending media is visible only to
 * the winery's managers and staff; claim evidence only to staff.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const rel = (await params).path.map(decodeURIComponent).join("/");
  const [m] = await sql<{ mime: string; status: string; kind: string; winery_id: number | null }[]>`
    select mime, status, kind, winery_id from media where storage_path = ${rel}`;
  if (!m) return new NextResponse("Not found", { status: 404 });
  const isPublic = m.status === "approved" && m.kind !== "claim_evidence";
  if (!isPublic) {
    const user = await getCurrentUser();
    const allowed = m.kind === "claim_evidence" ? isStaff(user) : m.winery_id != null && (await canManageWinery(user, m.winery_id));
    if (!allowed) return new NextResponse("Not found", { status: 404 });
  }
  try {
    const body = await readUpload(rel);
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": m.mime,
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
        "Cache-Control": isPublic ? "public, max-age=86400" : "private, no-store",
        "Content-Disposition": m.mime === "application/pdf" ? "inline" : "inline",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
