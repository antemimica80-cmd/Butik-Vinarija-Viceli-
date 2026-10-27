import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { ActionForm } from "@/components/forms/ActionForm";
import { Icon } from "@/components/Icon";
import { pageWineryManager } from "@/lib/page-auth";
import { wineryForOwner } from "@/lib/queries/owner";
import { saveWine, saveVintage, submitAward, deleteWine } from "@/app/actions/owner";
import { sql } from "@/lib/db";
import { MEDALS, WINE_TYPES } from "@/lib/constants";
import type { LocalizedContent, LocalizedText } from "@/lib/content";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false } };

type WineRow = { id: number; slug: string; name: string; type: string; styles: string[]; content: LocalizedContent; serving_temp: string | null; aging_potential: string | null; purchase_url: string | null; site_slug: string | null; grapes: { slug: string; percentage: string | null }[]; vintages: { year: number | null }[] };
const STYLES = ["dry", "off_dry", "sweet", "barrique", "amphora", "skin_contact", "traditional_method", "pet_nat", "acacia_barrel", "predicate", "ice_wine"];

export default async function OwnerWinesPage({ params }: { params: Promise<{ locale: Locale; winery: string }> }) {
  const { locale, winery } = await params;
  setRequestLocale(locale);
  const w = await wineryForOwner(winery);
  if (!w) notFound();
  await pageWineryManager(locale, w.id, `/${locale}/owner/${winery}/wines`);
  const [t, tf, tw, ts, tm] = await Promise.all([getTranslations("owner"), getTranslations("form"), getTranslations("wineType"), getTranslations("wineStyle"), getTranslations("medal")]);
  const [wines, grapes, sites, comps] = await Promise.all([
    sql<WineRow[]>`select wi.id, wi.slug, wi.name, wi.type, wi.styles, wi.content, wi.serving_temp, wi.aging_potential, wi.purchase_url, vs.slug as site_slug,
        coalesce((select json_agg(json_build_object('slug', g.slug, 'percentage', c.percentage)) from wine_grape_compositions c join grape_varieties g on g.id = c.grape_id where c.wine_id = wi.id and c.vintage_id is null), '[]') as grapes,
        coalesce((select json_agg(json_build_object('year', v.year) order by v.year desc) from wine_vintages v where v.wine_id = wi.id), '[]') as vintages
      from wines wi left join vineyard_sites vs on vs.id = wi.vineyard_site_id where wi.winery_id = ${w.id} and wi.status <> 'archived' order by wi.name`,
    sql<{ slug: string; name_hr: string }[]>`select slug, name_hr from grape_varieties order by (origin = 'indigenous') desc, name_hr`,
    sql<{ slug: string; name: LocalizedText }[]>`select slug, name from vineyard_sites order by official_name`,
    sql<{ slug: string; name: string }[]>`select slug, name from competitions order by sort`,
  ]);
  const msgs = { published: t("profileSavedDirect"), submitted: t("profileSaved"), error: tf("error"), pending: tf("saving") };

  const wineFields = (wine?: WineRow) => (
    <>
      <input type="hidden" name="wineryId" value={w.id} />
      {wine && <input type="hidden" name="wineId" value={wine.id} />}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2"><label className="field-label">{tf("wineName")}<input name="name" required maxLength={160} defaultValue={wine?.name} className="field mt-1" /></label></div>
        <div><label className="field-label">{tf("type")}<select name="type" defaultValue={wine?.type ?? "white"} className="field mt-1">{WINE_TYPES.map((x) => <option key={x} value={x}>{tw(x)}</option>)}</select></label></div>
      </div>
      <div><p className="field-label">{tf("styles")}</p><div className="flex flex-wrap gap-3">{STYLES.map((s) => <label key={s} className="flex items-center gap-1.5 text-sm"><input type="checkbox" name="styles" value={s} defaultChecked={wine?.styles.includes(s)} className="accent-[#193C34]" />{ts(s as "dry")}</label>)}</div></div>
      <div>
        <p className="field-label">{tf("grapes")}</p>
        <div className="grid max-h-56 gap-1.5 overflow-y-auto rounded-xl border border-line p-3 sm:grid-cols-2 lg:grid-cols-3">
          {grapes.map((g) => {
            const cur = wine?.grapes.find((x) => x.slug === g.slug);
            return (
              <div key={g.slug} className="flex items-center gap-2 text-sm">
                <label className="flex flex-1 items-center gap-1.5"><input type="checkbox" name="grape" value={g.slug} defaultChecked={!!cur} className="accent-[#193C34]" />{g.name_hr}</label>
                <input name={`pct.${g.slug}`} type="number" min={0.1} max={100} step="0.1" defaultValue={cur?.percentage ?? ""} placeholder="%" className="w-16 rounded-lg border border-line px-1.5 py-1 text-xs" aria-label={`${g.name_hr} %`} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="field-label">{tf("site")}<select name="site" defaultValue={wine?.site_slug ?? ""} className="field mt-1"><option value="">{tf("noSite")}</option>{sites.map((s) => <option key={s.slug} value={s.slug}>{s.name?.hr}</option>)}</select></label>
        <label className="field-label">{tf("serving")}<input name="serving_temp" maxLength={40} defaultValue={wine?.serving_temp ?? ""} placeholder="12–14 °C" className="field mt-1" /></label>
        <label className="field-label">{tf("aging")}<input name="aging_potential" maxLength={80} defaultValue={wine?.aging_potential ?? ""} className="field mt-1" /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(["hr", "en"] as const).map((l) => (
          <div key={l} className="space-y-3" lang={l}>
            <p className="eyebrow">{l === "hr" ? tf("croatian") : tf("english")}</p>
            <label className="field-label">{tf("description")}<textarea name={`description_${l}`} maxLength={4000} defaultValue={wine?.content?.[l]?.description ?? ""} className="field mt-1 !min-h-20" /></label>
            <label className="field-label">{tf("tasting")}<textarea name={`tasting_${l}`} maxLength={3000} defaultValue={wine?.content?.[l]?.tasting_notes ?? ""} className="field mt-1 !min-h-20" /></label>
            <label className="field-label">{tf("pairing")}<input name={`pairing_${l}`} maxLength={1500} defaultValue={wine?.content?.[l]?.pairing ?? ""} className="field mt-1" /></label>
          </div>
        ))}
      </div>
      <label className="field-label">{tf("purchaseUrl")}<input name="purchase_url" type="url" defaultValue={wine?.purchase_url ?? ""} className="field mt-1" /></label>
    </>
  );

  return (
    <OwnerShell winery={w} active="wines">
      <div className="space-y-4">
        {wines.map((wine) => (
          <details key={wine.id} className="card group">
            <summary className="flex cursor-pointer list-none items-center justify-between p-5 [&::-webkit-details-marker]:hidden">
              <span><span className="font-display text-2xl">{wine.name}</span> <span className="text-sm text-stone-700">· {tw(wine.type as "red")} · {wine.vintages.map((v) => v.year ?? "NV").join(", ")}</span></span>
              <span className="flex items-center gap-1 text-sm text-forest"><Icon name="edit" size={15} /> {tf("edit")}</span>
            </summary>
            <div className="space-y-8 border-t border-line p-5">
              <ActionForm action={saveWine} submitLabel={t("saveWine")} messages={msgs} className="space-y-4">{wineFields(wine)}</ActionForm>
              <div className="rounded-2xl bg-ivory p-4">
                <h3 className="font-display text-xl">{tf("addVintage")}</h3>
                <ActionForm action={saveVintage} submitLabel={tf("addVintage")} messages={msgs} className="mt-3 grid gap-3 md:grid-cols-4">
                  <input type="hidden" name="wineryId" value={w.id} /><input type="hidden" name="wineId" value={wine.id} />
                  <label className="field-label">{tf("vintage")}<input name="year" type="number" min={1900} max={2100} className="field mt-1" /></label>
                  <label className="field-label">{tf("alcohol")}<input name="alcohol" type="number" step="0.1" min={0} max={25} className="field mt-1" /></label>
                  <label className="field-label">{tf("sugar")}<input name="sugar" type="number" step="0.1" min={0} className="field mt-1" /></label>
                  <label className="field-label">{tf("acidity")}<input name="acidity" type="number" step="0.1" min={0} className="field mt-1" /></label>
                  <label className="field-label md:col-span-2">{tf("barrel")}<input name="barrel" maxLength={200} className="field mt-1" /></label>
                  <label className="field-label">{tf("price")}<input name="price" type="number" step="0.01" min={0} className="field mt-1" /></label>
                </ActionForm>
              </div>
              <div className="rounded-2xl bg-brass-100/60 p-4">
                <h3 className="font-display text-xl">{t("submitAward")}</h3>
                <p className="mt-1 text-xs text-stone-700">{t("awardHint")}</p>
                <ActionForm action={submitAward} submitLabel={t("submitAward")} messages={msgs} className="mt-3 grid gap-3 md:grid-cols-3">
                  <input type="hidden" name="wineryId" value={w.id} /><input type="hidden" name="wineId" value={wine.id} />
                  <label className="field-label">{tf("competition")}<select name="competition" className="field mt-1">{comps.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
                  <label className="field-label">{tf("year")}<input name="year" type="number" required min={1950} max={2100} className="field mt-1" /></label>
                  <label className="field-label">{tf("vintage")}<input name="vintage" type="number" min={1900} max={2100} className="field mt-1" /></label>
                  <label className="field-label">{tf("medal")}<select name="medal" className="field mt-1">{MEDALS.map((m) => <option key={m} value={m}>{tm(m)}</option>)}</select></label>
                  <label className="field-label">{tf("score")}<input name="score" type="number" step="0.1" min={0} max={100} className="field mt-1" /></label>
                  <label className="field-label">{tf("sourceUrl")}<input name="sourceUrl" type="url" required className="field mt-1" /></label>
                </ActionForm>
              </div>
              <form action={deleteWine}><input type="hidden" name="wineryId" value={w.id} /><input type="hidden" name="wineId" value={wine.id} /><button className="btn btn-ghost btn-sm text-burgundy"><Icon name="trash" size={15} /> {t("deactivate")}</button></form>
            </div>
          </details>
        ))}
        <details className="card" open={wines.length === 0}>
          <summary className="flex cursor-pointer list-none items-center gap-2 p-5 font-display text-2xl text-forest [&::-webkit-details-marker]:hidden"><Icon name="plus" /> {t("addWine")}</summary>
          <div className="border-t border-line p-5"><ActionForm action={saveWine} submitLabel={t("saveWine")} messages={msgs} className="space-y-4">{wineFields()}</ActionForm></div>
        </details>
      </div>
    </OwnerShell>
  );
}
