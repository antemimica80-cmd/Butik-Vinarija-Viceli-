import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { ActionForm } from "@/components/forms/ActionForm";
import { pageStaff } from "@/lib/page-auth";
import { createWinery } from "@/app/actions/admin";
import { getRegions } from "@/lib/queries/catalog";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "New winery" };

export default async function NewWinery({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/wineries/new`);
  const regions = await getRegions();
  return (
    <AdminShell user={user} active="wineries" title="New winery">
      <div className="card max-w-xl p-6">
        <p className="mb-4 text-sm text-stone-700">Creates a draft. Complete location, sources and content on the next screen, then publish. Search the list first to avoid duplicates.</p>
        <ActionForm action={createWinery} submitLabel="Create draft" messages={{ error: "Please check the fields.", pending: "Creating…" }}>
          <input type="hidden" name="locale" value={locale} />
          <label className="field-label">Name<input name="name" required className="field mt-1" /></label>
          <label className="field-label">Slug (optional)<input name="slug" pattern="[a-z0-9-]*" className="field mt-1" /></label>
          <label className="field-label">Region<select name="region" className="field mt-1" required>{regions.map((r) => <option key={r.slug} value={r.slug}>{r.official_name}</option>)}</select></label>
        </ActionForm>
      </div>
    </AdminShell>
  );
}
