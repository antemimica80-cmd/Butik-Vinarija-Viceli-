import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell, Table } from "@/components/admin/AdminShell";
import { Link } from "@/i18n/navigation";
import { RegionDot } from "@/components/ui";
import { pageStaff } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import { tokenize } from "@/lib/norm";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Wineries" };

export default async function AdminWineries({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ q?: string; status?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/wineries`);
  const sp = await searchParams;
  const tokens = tokenize(sp.q);
  const status = ["draft", "published", "archived"].includes(sp.status ?? "") ? sp.status : undefined;
  const conds = [sql`true`, ...tokens.map((t) => sql`w.search_norm like ${"%" + t + "%"}`), ...(status ? [sql`w.status = ${status}`] : [])];
  const rows = await sql<{ id: number; slug: string; name: string; status: string; verification: string; town: string | null; precision: string | null; color: string | null; owners: number; wines: number; updated_at: string }[]>`
    select w.id, w.slug, w.name, w.status, w.verification, l.town, l.precision, r.color,
      (select count(*)::int from winery_owners o where o.winery_id = w.id) as owners,
      (select count(*)::int from wines wi where wi.winery_id = w.id) as wines, w.updated_at
    from wineries w left join winery_locations l on l.winery_id = w.id and l.is_primary left join wine_regions r on r.id = w.region_id
    where ${conds.reduce((a, b) => sql`${a} and ${b}`)} order by w.updated_at desc limit 500`;
  return (
    <AdminShell user={user} active="wineries" title={`Wineries (${rows.length})`} actions={<Link href="/admin/wineries/new" className="btn btn-primary btn-sm">+ New winery</Link>}>
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Search…" className="field !w-72" aria-label="Search" />
        <select name="status" defaultValue={status ?? ""} className="field !w-40" aria-label="Status"><option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
        <button className="btn btn-ghost">Filter</button>
        <a href="/api/admin/export/wineries" className="btn btn-ghost">Export CSV</a>
      </form>
      <Table head={["Name", "Status", "Verification", "Location", "Wines", "Owners", ""]}>
        {rows.map((w) => (
          <tr key={w.id}>
            <td className="p-3"><span className="flex items-center gap-2"><RegionDot color={w.color} /><Link href={{ pathname: "/admin/wineries/[id]", params: { id: String(w.id) } }} className="font-medium text-forest underline">{w.name}</Link></span></td>
            <td className="p-3">{w.status}</td>
            <td className="p-3">{w.verification}</td>
            <td className="p-3">{w.town} <span className="text-xs text-stone-700">{w.precision}</span></td>
            <td className="p-3">{w.wines}</td>
            <td className="p-3">{w.owners}</td>
            <td className="p-3"><Link href={{ pathname: "/wineries/[slug]", params: { slug: w.slug } }} className="text-xs underline">public</Link></td>
          </tr>
        ))}
      </Table>
    </AdminShell>
  );
}
