import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { Link } from "@/i18n/navigation";
import { pageStaff } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import { resolveReport } from "@/app/actions/admin";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Reports" };

export default async function AdminReports({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/reports`);
  const rows = await sql<{ id: number; winery_id: number | null; winery: string | null; field: string | null; message: string; reporter_email: string | null; status: string; created_at: string }[]>`
    select r.id, r.winery_id, w.name as winery, r.field, r.message, r.reporter_email, r.status, r.created_at
    from data_reports r left join wineries w on w.id = r.winery_id order by (r.status = 'open') desc, r.created_at desc limit 300`;
  return (
    <AdminShell user={user} active="reports" title="Reports of inaccurate information">
      <div className="space-y-3">
        {rows.map((r) => (
          <article key={r.id} className="card p-4">
            <p className="text-sm">{r.winery_id ? <Link href={{ pathname: "/admin/wineries/[id]", params: { id: String(r.winery_id) } }} className="font-medium text-forest underline">{r.winery}</Link> : "—"} · {r.field} · <span className="text-stone-700">{new Date(r.created_at).toISOString().slice(0, 10)}</span> · <span className="chip">{r.status}</span></p>
            <p className="mt-2 whitespace-pre-line text-sm">{r.message}</p>
            {r.reporter_email && <p className="mt-1 text-xs text-stone-700">{r.reporter_email}</p>}
            <form action={resolveReport} className="mt-3 flex gap-2"><input type="hidden" name="id" value={r.id} />
              <button name="status" value="resolved" className="btn btn-primary btn-sm">Resolved</button>
              <button name="status" value="dismissed" className="btn btn-ghost btn-sm">Dismiss</button>
              {r.status !== "open" && <button name="status" value="open" className="btn btn-ghost btn-sm">Reopen</button>}</form>
          </article>
        ))}
        {!rows.length && <p className="text-stone-700">No reports.</p>}
      </div>
    </AdminShell>
  );
}
