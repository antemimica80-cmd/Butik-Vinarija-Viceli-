import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell, Stat } from "@/components/admin/AdminShell";
import { pageStaff } from "@/lib/page-auth";
import { qualitySummary } from "@/lib/queries/quality";
import { coverage } from "@/lib/queries/catalog";
import { pick } from "@/lib/content";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Admin" };

export default async function AdminDashboard({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin`);
  const [q, cov] = await Promise.all([qualitySummary(), coverage()]);
  return (
    <AdminShell user={user} active="dashboard" title="Dashboard">
      <h2 className="mb-3 text-xl">Queues</h2>
      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <Stat label="Pending changes" value={q.pending_changes} href="/admin/changes" tone="warn" />
        <Stat label="Pending media" value={q.pending_media} href="/admin/changes" tone="warn" />
        <Stat label="Ownership claims" value={q.pending_claims} href="/admin/claims" tone="warn" />
        <Stat label="Error reports" value={q.open_reports} href="/admin/reports" tone="warn" />
        <Stat label="New inquiries" value={q.new_inquiries} href="/admin/inquiries" />
        <Stat label="Undelivered email" value={q.undelivered_email} href="/admin/email" tone="warn" />
      </div>
      <h2 className="mb-3 mt-10 text-xl">Data quality</h2>
      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <Stat label="Published wineries" value={q.published} href="/admin/wineries" />
        <Stat label="Drafts" value={q.drafts} href="/admin/wineries" />
        <Stat label="Unverified records" value={q.unverified} href="/admin/quality" tone="warn" />
        <Stat label="Approximate locations" value={q.approximate_location} href="/admin/quality" tone="warn" />
        <Stat label="Missing coordinates" value={q.missing_coordinates} href="/admin/quality" tone="warn" />
        <Stat label="Missing website" value={q.missing_website} href="/admin/quality" tone="warn" />
        <Stat label="No contact details" value={q.missing_contact} href="/admin/quality" tone="warn" />
        <Stat label="Missing sources" value={q.missing_sources} href="/admin/quality" tone="warn" />
        <Stat label="Missing translation" value={q.missing_translation} href="/admin/quality" tone="warn" />
        <Stat label="Unverified awards" value={q.unverified_awards} href="/admin/awards" tone="warn" />
        <Stat label="Possible duplicates" value={q.possible_duplicates} href="/admin/quality" tone="warn" />
      </div>
      <h2 className="mb-3 mt-10 text-xl">Coverage by region</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cov.map((c) => <Stat key={c.slug} label={pick(c.name, locale)} value={c.wineries} />)}
      </div>
    </AdminShell>
  );
}
