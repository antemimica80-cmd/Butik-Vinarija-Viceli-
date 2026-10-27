import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { ActionForm } from "@/components/forms/ActionForm";
import { Icon } from "@/components/Icon";
import { pageWineryManager } from "@/lib/page-auth";
import { wineryForOwner } from "@/lib/queries/owner";
import { saveExperience, toggleExperience } from "@/app/actions/owner";
import { sql } from "@/lib/db";
import { EXPERIENCE_KINDS, VISIT_LANGUAGES } from "@/lib/constants";
import type { LocalizedText } from "@/lib/content";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false } };

type Exp = { id: number; kind: string; name: LocalizedText; description: LocalizedText; wines_included: number | null; duration_min: number | null; price_eur: string | null; min_group: number | null; max_group: number | null; food_included: boolean | null; appointment_required: boolean | null; languages: string[]; is_active: boolean; verification: string };

export default async function OwnerExperiencesPage({ params }: { params: Promise<{ locale: Locale; winery: string }> }) {
  const { locale, winery } = await params;
  setRequestLocale(locale);
  const w = await wineryForOwner(winery);
  if (!w) notFound();
  await pageWineryManager(locale, w.id, `/${locale}/owner/${winery}/experiences`);
  const [t, tf, tk, tl, tv] = await Promise.all([getTranslations("owner"), getTranslations("form"), getTranslations("experienceKind"), getTranslations("language"), getTranslations("verification")]);
  const items = await sql<Exp[]>`select id, kind, name, description, wines_included, duration_min, price_eur, min_group, max_group, food_included, appointment_required, languages, is_active, verification
    from tasting_experiences where winery_id = ${w.id} order by sort, id`;
  const msgs = { published: t("profileSavedDirect"), submitted: t("profileSaved"), error: tf("error"), pending: tf("saving") };
  const fields = (e?: Exp) => (
    <>
      <input type="hidden" name="wineryId" value={w.id} />
      {e && <input type="hidden" name="id" value={e.id} />}
      <div className="grid gap-4 md:grid-cols-3">
        <label className="field-label">{tf("expKind")}<select name="kind" defaultValue={e?.kind ?? "tasting"} className="field mt-1">{EXPERIENCE_KINDS.map((k) => <option key={k} value={k}>{tk(k)}</option>)}</select></label>
        <label className="field-label">{tf("nameHr")}<input name="name_hr" required maxLength={160} defaultValue={e?.name?.hr} className="field mt-1" /></label>
        <label className="field-label">{tf("nameEn")}<input name="name_en" required maxLength={160} defaultValue={e?.name?.en} className="field mt-1" /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="field-label">{tf("descHr")}<textarea name="desc_hr" maxLength={2000} defaultValue={e?.description?.hr} className="field mt-1 !min-h-20" /></label>
        <label className="field-label">{tf("descEn")}<textarea name="desc_en" maxLength={2000} defaultValue={e?.description?.en} className="field mt-1 !min-h-20" /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <label className="field-label">{tf("winesIncluded")}<input name="wines" type="number" min={0} max={50} defaultValue={e?.wines_included ?? ""} className="field mt-1" /></label>
        <label className="field-label">{tf("duration")}<input name="duration" type="number" min={10} max={1440} defaultValue={e?.duration_min ?? ""} className="field mt-1" /></label>
        <label className="field-label">{tf("pricePerPerson")}<input name="price" type="number" min={0} step="0.5" defaultValue={e?.price_eur ?? ""} className="field mt-1" /></label>
        <label className="field-label">{tf("minGroup")}<input name="minGroup" type="number" min={1} defaultValue={e?.min_group ?? ""} className="field mt-1" /></label>
        <label className="field-label">{tf("maxGroup")}<input name="maxGroup" type="number" min={1} defaultValue={e?.max_group ?? ""} className="field mt-1" /></label>
      </div>
      <div className="flex flex-wrap gap-5 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="food" defaultChecked={!!e?.food_included} className="accent-[#193C34]" />{tf("food")}</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="appointment" defaultChecked={e?.appointment_required ?? true} className="accent-[#193C34]" />{tf("appointment")}</label>
      </div>
      <div><p className="field-label">{tf("languages")}</p><div className="flex flex-wrap gap-3">{VISIT_LANGUAGES.map((l) => <label key={l} className="flex items-center gap-1.5 text-sm"><input type="checkbox" name="languages" value={l} defaultChecked={e?.languages.includes(l)} className="accent-[#193C34]" />{tl(l)}</label>)}</div></div>
    </>
  );
  return (
    <OwnerShell winery={w} active="experiences">
      <div className="space-y-4">
        {items.map((e) => (
          <details key={e.id} className="card">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 p-5 [&::-webkit-details-marker]:hidden">
              <span><span className="font-display text-2xl">{e.name?.[locale] ?? e.name?.hr}</span> <span className="text-sm text-stone-700">· {tk(e.kind as "tasting")} · {tv(e.verification as "unverified")}</span></span>
              <span className={`chip ${e.is_active ? "chip-forest" : ""}`}>{e.is_active ? tf("active") : tf("inactive")}</span>
            </summary>
            <div className="space-y-4 border-t border-line p-5">
              <ActionForm action={saveExperience} submitLabel={t("saveExperience")} messages={msgs} className="space-y-4">{fields(e)}</ActionForm>
              <form action={toggleExperience}><input type="hidden" name="wineryId" value={w.id} /><input type="hidden" name="id" value={e.id} /><button className="btn btn-ghost btn-sm">{e.is_active ? t("deactivate") : tf("activate")}</button></form>
            </div>
          </details>
        ))}
        <details className="card" open={items.length === 0}>
          <summary className="flex cursor-pointer list-none items-center gap-2 p-5 font-display text-2xl text-forest [&::-webkit-details-marker]:hidden"><Icon name="plus" /> {t("addExperience")}</summary>
          <div className="border-t border-line p-5"><ActionForm action={saveExperience} submitLabel={t("saveExperience")} messages={msgs} className="space-y-4">{fields()}</ActionForm></div>
        </details>
      </div>
    </OwnerShell>
  );
}
