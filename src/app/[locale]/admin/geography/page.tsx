import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { ActionForm } from "@/components/forms/ActionForm";
import { pageStaff } from "@/lib/page-auth";
import { getRegions, getSubregions, getDistricts } from "@/lib/queries/catalog";
import { saveRegionContent, addDistrict } from "@/app/actions/admin";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Geography" };

const KEYS = ["tagline", "intro", "climate", "soil", "varieties", "styles"] as const;

export default async function AdminGeography({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/geography`);
  const [regions, subs, dists] = await Promise.all([getRegions(), getSubregions(), getDistricts()]);
  const msgs = { published: "Saved.", error: "Check fields:", pending: "Saving…" };
  return (
    <AdminShell user={user} active="geography" title="Viticultural geography">
      <p className="mb-6 max-w-3xl text-sm text-stone-700">
        Regions and subregions follow NN 76/2019 as carried into Pravilnik o vinogradarstvu (NN 81/2022). Add wine districts only from the regulation&apos;s annex,
        with the source URL. Boundary polygons are imported with <code>npm run import:geometry</code> from an authoritative GIS file — never drawn by hand.
      </p>
      <div className="space-y-4">
        {regions.map((r) => (
          <details key={r.slug} className="card">
            <summary className="flex cursor-pointer list-none justify-between p-5 [&::-webkit-details-marker]:hidden">
              <span className="font-display text-2xl">{r.official_name}</span>
              <span className="text-sm text-stone-700">{r.winery_count} wineries · geometry: {r.has_geom ? "imported" : "none"} · {r.verification}</span>
            </summary>
            <div className="border-t border-line p-5">
              <p className="mb-3 text-sm">Subregions: {subs.filter((s) => s.region_slug === r.slug).map((s) => `${s.official_name} (${dists.filter((d) => d.subregion_slug === s.slug).map((d) => d.official_name).join(", ") || "no districts"})`).join(" · ")}</p>
              <ActionForm action={saveRegionContent} submitLabel="Save region content" messages={msgs} className="space-y-4">
                <input type="hidden" name="id" value={r.id} />
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="field-label">Name (HR)<input name="name_hr" defaultValue={r.name?.hr} className="field mt-1" /></label>
                  <label className="field-label">Name (EN)<input name="name_en" defaultValue={r.name?.en} className="field mt-1" /></label>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  {(["hr", "en"] as const).map((l) => (
                    <div key={l} className="space-y-3">
                      <p className="eyebrow">{l.toUpperCase()}</p>
                      {KEYS.map((k) => <label key={k} className="field-label">{k}<textarea name={`${l}.${k}`} defaultValue={r.content?.[l]?.[k] ?? ""} className="field mt-1 !min-h-16" /></label>)}
                      <label className="field-label">Content status<select name={`${l}.status`} defaultValue={r.content?.[l]?.status ?? "draft"} className="field mt-1"><option value="draft">draft (shows review notice)</option><option value="reviewed">reviewed by expert</option></select></label>
                    </div>
                  ))}
                </div>
              </ActionForm>
            </div>
          </details>
        ))}
      </div>
      <section className="card mt-8 p-6">
        <h2 className="font-display text-2xl">Add wine district (vinogorje)</h2>
        <ActionForm action={addDistrict} submitLabel="Add district" messages={msgs} className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="field-label">Subregion<select name="subregion" className="field mt-1">{subs.map((s) => <option key={s.slug} value={s.slug}>{s.official_name}</option>)}</select></label>
          <label className="field-label">Official name<input name="official" required className="field mt-1" /></label>
          <label className="field-label">English name<input name="en" className="field mt-1" /></label>
          <label className="field-label">Official source URL<input name="sourceUrl" type="url" className="field mt-1" /></label>
        </ActionForm>
      </section>
    </AdminShell>
  );
}
