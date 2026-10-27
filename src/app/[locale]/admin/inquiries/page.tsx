import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell, Table } from "@/components/admin/AdminShell";
import { Link } from "@/i18n/navigation";
import { pageStaff } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Inquiries" };

export default async function AdminInquiries({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/inquiries`);
  const rows = await sql<{ id: string; public_ref: string; status: string; winery: string; slug: string; winery_email: string | null; full_name: string; email: string; preferred_date: string | null; adults: number; created_at: string; mail: string | null }[]>`
    select i.id, i.public_ref, i.status, w.name as winery, w.slug, w.email as winery_email, i.full_name, i.email, i.preferred_date, i.adults, i.created_at,
      (select string_agg(o.kind || ':' || o.status, ', ') from email_outbox o where o.inquiry_id = i.id) as mail
    from tasting_inquiries i join wineries w on w.id = i.winery_id order by i.created_at desc limit 300`;
  return (
    <AdminShell user={user} active="inquiries" title={`Inquiries (${rows.length})`}>
      <p className="mb-4 text-sm text-stone-700">Personal data — handle under the privacy policy. Requests to wineries without a public email are routed to EDITORIAL_EMAIL for manual forwarding.</p>
      <Table head={["Ref", "Created", "Winery", "Visitor", "Date", "Guests", "Status", "Email delivery"]}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="p-3 font-mono text-xs">{r.public_ref}</td>
            <td className="p-3 text-xs">{new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}</td>
            <td className="p-3"><Link href={{ pathname: "/owner/[winery]/inquiries", params: { winery: r.slug } }} className="text-forest underline">{r.winery}</Link>{!r.winery_email && <span className="block text-xs text-burgundy">no winery email</span>}</td>
            <td className="p-3">{r.full_name}<span className="block text-xs text-stone-700">{r.email}</span></td>
            <td className="p-3">{r.preferred_date?.slice(0, 10) ?? "flexible"}</td>
            <td className="p-3">{r.adults}</td>
            <td className="p-3">{r.status}</td>
            <td className="p-3 text-xs">{r.mail ?? "—"}</td>
          </tr>
        ))}
      </Table>
    </AdminShell>
  );
}
