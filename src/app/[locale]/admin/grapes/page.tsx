import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { ActionForm } from "@/components/forms/ActionForm";
import { pageStaff } from "@/lib/page-auth";
import { getGrapes } from "@/lib/queries/catalog";
import { saveGrape } from "@/app/actions/admin";
import { VERIFICATION_STATES } from "@/lib/constants";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Grapes" };
const KEYS = ["summary", "style", "aroma", "pairing"] as const;

export default async function AdminGrapes({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/grapes`);
  const grapes = await getGrapes();
  return (
    <AdminShell user={user} active="grapes" title={`Grape varieties (${grapes.length})`}>
      <div className="space-y-3">
        {grapes.map((g) => (
          <details key={g.slug} className="card">
            <summary className="flex cursor-pointer list-none justify-between p-4 [&::-webkit-details-marker]:hidden"><span className="font-medium">{g.name_hr} / {g.name_en}</span><span className="text-xs text-stone-700">{g.origin} · {g.verification} · {g.winery_count} wineries</span></summary>
            <div className="border-t border-line p-5">
              <ActionForm action={saveGrape} submitLabel="Save grape" messages={{ published: "Saved.", error: "Check fields:", pending: "Saving…" }} className="space-y-4">
                <input type="hidden" name="id" value={g.id} />
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="field-label">Croatian name<input name="name_hr" defaultValue={g.name_hr} className="field mt-1" /></label>
                  <label className="field-label">English name<input name="name_en" defaultValue={g.name_en} className="field mt-1" /></label>
                  <label className="field-label">Synonyms (comma-separated)<input name="synonyms" defaultValue={g.synonyms.join(", ")} className="field mt-1" /></label>
                  <label className="field-label">Berry colour<select name="berry_color" defaultValue={g.berry_color} className="field mt-1"><option>white</option><option>red</option><option>grey</option></select></label>
                  <label className="field-label">Origin<select name="origin" defaultValue={g.origin} className="field mt-1"><option>indigenous</option><option>regional</option><option>international</option></select></label>
                  <label className="field-label">Verification<select name="verification" defaultValue={g.verification} className="field mt-1">{VERIFICATION_STATES.map((v) => <option key={v}>{v}</option>)}</select></label>
                  <label className="field-label md:col-span-3">Parentage (with source)<input name="parentage" defaultValue={g.parentage ?? ""} className="field mt-1" /></label>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  {(["hr", "en"] as const).map((l) => (
                    <div key={l} className="space-y-3">
                      <p className="eyebrow">{l.toUpperCase()}</p>
                      {KEYS.map((k) => <label key={k} className="field-label">{k}<textarea name={`${l}.${k}`} defaultValue={g.content?.[l]?.[k] ?? ""} className="field mt-1 !min-h-16" /></label>)}
                      <label className="field-label">Content status<select name={`${l}.status`} defaultValue={g.content?.[l]?.status ?? "draft"} className="field mt-1"><option value="draft">draft</option><option value="reviewed">reviewed by expert</option></select></label>
                    </div>
                  ))}
                </div>
              </ActionForm>
            </div>
          </details>
        ))}
      </div>
    </AdminShell>
  );
}
