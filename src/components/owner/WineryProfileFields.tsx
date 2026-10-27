import { getTranslations } from "next-intl/server";
import { sql } from "@/lib/db";
import { FACILITIES, SIZE_CATEGORIES, VISIT_LANGUAGES } from "@/lib/constants";

type Content = Record<string, Record<string, string>>;
export type ProfileDefaults = {
  content: Content; website: string | null; email: string | null; phone: string | null; whatsapp: string | null;
  instagram: string | null; facebook: string | null; youtube: string | null; opening_hours: { hr?: string; en?: string } | null;
  appointment_only: boolean | null; languages: string[]; founded_year: number | null; founder: string | null; owner_name: string | null;
  winemaker_name: string | null; family_run: boolean | null; size_category: string | null;
  grapes: { slug: string; relation: string; is_signature: boolean }[]; facilities: string[];
};

export async function loadProfileDefaults(wineryId: number): Promise<ProfileDefaults> {
  const [w] = await sql<ProfileDefaults[]>`
    select content, website, email, phone, whatsapp, instagram, facebook, youtube, opening_hours, appointment_only, languages,
      founded_year, founder, owner_name, winemaker_name, family_run, size_category,
      coalesce((select json_agg(json_build_object('slug', g.slug, 'relation', wg.relation, 'is_signature', wg.is_signature))
        from winery_grape_varieties wg join grape_varieties g on g.id = wg.grape_id where wg.winery_id = w.id), '[]') as grapes,
      coalesce((select array_agg(facility) from winery_facilities where winery_id = w.id), '{}') as facilities
    from wineries w where w.id = ${wineryId}`;
  return w;
}

const Tri = ({ name, value, labels }: { name: string; value: boolean | null; labels: { yes: string; no: string; unknown: string } }) => (
  <select name={name} defaultValue={value == null ? "" : value ? "yes" : "no"} className="field">
    <option value="">{labels.unknown}</option><option value="yes">{labels.yes}</option><option value="no">{labels.no}</option>
  </select>
);

/** Profile fields shared by the owner portal and the admin editor. */
export async function WineryProfileFields({ d }: { d: ProfileDefaults }) {
  const [t, tw, tf, tl, ts] = await Promise.all([getTranslations("form"), getTranslations("winery"), getTranslations("facility"), getTranslations("language"), getTranslations("size")]);
  const grapes = await sql<{ slug: string; name_hr: string; origin: string }[]>`select slug, name_hr, origin from grape_varieties order by (origin = 'indigenous') desc, name_hr`;
  const tri = { yes: t("yes"), no: t("no"), unknown: t("unknown") };
  return (
    <div className="space-y-8">
      <fieldset className="card space-y-5 p-6">
        <legend className="px-1 font-display text-2xl">{t("about")}</legend>
        <p className="text-xs text-stone-700">{t("translationNote")}</p>
        <div className="grid gap-6 lg:grid-cols-2">
          {(["hr", "en"] as const).map((l) => (
            <div key={l} className="space-y-4" lang={l}>
              <p className="eyebrow">{l === "hr" ? t("croatian") : t("english")}</p>
              <div><label className="field-label" htmlFor={`${l}.short`}>{t("short")}</label><textarea id={`${l}.short`} name={`${l}.short`} maxLength={400} defaultValue={d.content?.[l]?.short ?? ""} className="field !min-h-20" /></div>
              <div><label className="field-label" htmlFor={`${l}.description`}>{t("description")}</label><textarea id={`${l}.description`} name={`${l}.description`} maxLength={6000} defaultValue={d.content?.[l]?.description ?? ""} className="field !min-h-36" /></div>
              <div><label className="field-label" htmlFor={`${l}.story`}>{t("story")}</label><textarea id={`${l}.story`} name={`${l}.story`} maxLength={8000} defaultValue={d.content?.[l]?.story ?? ""} className="field" /></div>
              <div><label className="field-label" htmlFor={`${l}.philosophy`}>{t("philosophy")}</label><textarea id={`${l}.philosophy`} name={`${l}.philosophy`} maxLength={4000} defaultValue={d.content?.[l]?.philosophy ?? ""} className="field" /></div>
              <div><label className="field-label" htmlFor={`${l}.winemaker_bio`}>{t("winemakerBio")}</label><textarea id={`${l}.winemaker_bio`} name={`${l}.winemaker_bio`} maxLength={3000} defaultValue={d.content?.[l]?.winemaker_bio ?? ""} className="field" /></div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="card grid gap-5 p-6 md:grid-cols-2">
        <legend className="px-1 font-display text-2xl">{t("contact")}</legend>
        <div><label className="field-label" htmlFor="website">{tw("website")}</label><input id="website" name="website" type="url" placeholder="https://" defaultValue={d.website ?? ""} className="field" /></div>
        <div><label className="field-label" htmlFor="email">{tw("email")}</label><input id="email" name="email" type="email" defaultValue={d.email ?? ""} className="field" /></div>
        <div><label className="field-label" htmlFor="phone">{tw("phone")}</label><input id="phone" name="phone" type="tel" defaultValue={d.phone ?? ""} className="field" /></div>
        <div><label className="field-label" htmlFor="whatsapp">{tw("whatsapp")}</label><input id="whatsapp" name="whatsapp" type="tel" defaultValue={d.whatsapp ?? ""} className="field" /></div>
        <div><label className="field-label" htmlFor="instagram">Instagram</label><input id="instagram" name="instagram" type="url" placeholder="https://instagram.com/…" defaultValue={d.instagram ?? ""} className="field" /></div>
        <div><label className="field-label" htmlFor="facebook">Facebook</label><input id="facebook" name="facebook" type="url" placeholder="https://facebook.com/…" defaultValue={d.facebook ?? ""} className="field" /></div>
        <div><label className="field-label" htmlFor="youtube">YouTube</label><input id="youtube" name="youtube" type="url" defaultValue={d.youtube ?? ""} className="field" /></div>
      </fieldset>

      <fieldset className="card space-y-5 p-6">
        <legend className="px-1 font-display text-2xl">{t("visits")}</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <div><label className="field-label" htmlFor="hours.hr">{t("hours")} — {t("croatian")}</label><input id="hours.hr" name="hours.hr" maxLength={400} defaultValue={d.opening_hours?.hr ?? ""} className="field" /></div>
          <div><label className="field-label" htmlFor="hours.en">{t("hours")} — {t("english")}</label><input id="hours.en" name="hours.en" maxLength={400} defaultValue={d.opening_hours?.en ?? ""} className="field" /></div>
          <div><label className="field-label" htmlFor="appointment_only">{t("appointmentOnly")}</label><Tri name="appointment_only" value={d.appointment_only} labels={tri} /></div>
        </div>
        <div>
          <p className="field-label">{tw("languagesSpoken")}</p>
          <div className="flex flex-wrap gap-3">
            {VISIT_LANGUAGES.map((l) => <label key={l} className="flex items-center gap-2 text-sm"><input type="checkbox" name="languages" value={l} defaultChecked={d.languages.includes(l)} className="h-4 w-4 accent-[#193C34]" />{tl(l)}</label>)}
          </div>
        </div>
        <div>
          <p className="field-label">{t("facilities")}</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {FACILITIES.map((f) => <label key={f} className="flex items-center gap-2 text-sm"><input type="checkbox" name="facilities" value={f} defaultChecked={d.facilities.includes(f)} className="h-4 w-4 accent-[#193C34]" />{tf(f)}</label>)}
          </div>
        </div>
      </fieldset>

      <fieldset className="card grid gap-5 p-6 md:grid-cols-3">
        <legend className="px-1 font-display text-2xl">{t("people")}</legend>
        <div><label className="field-label" htmlFor="founded_year">{tw("founded")}</label><input id="founded_year" name="founded_year" type="number" min={1000} max={2100} defaultValue={d.founded_year ?? ""} className="field" /></div>
        <div><label className="field-label" htmlFor="founder">{tw("founder")}</label><input id="founder" name="founder" defaultValue={d.founder ?? ""} className="field" /></div>
        <div><label className="field-label" htmlFor="owner_name">{tw("owner")}</label><input id="owner_name" name="owner_name" defaultValue={d.owner_name ?? ""} className="field" /></div>
        <div><label className="field-label" htmlFor="winemaker_name">{tw("winemaker")}</label><input id="winemaker_name" name="winemaker_name" defaultValue={d.winemaker_name ?? ""} className="field" /></div>
        <div><label className="field-label" htmlFor="family_run">{tw("familyRun")}</label><Tri name="family_run" value={d.family_run} labels={tri} /></div>
        <div>
          <label className="field-label" htmlFor="size_category">{tw("producerType")}</label>
          <select id="size_category" name="size_category" defaultValue={d.size_category ?? ""} className="field"><option value="">{t("unknown")}</option>{SIZE_CATEGORIES.map((s) => <option key={s} value={s}>{ts(s)}</option>)}</select>
        </div>
      </fieldset>

      <fieldset className="card p-6">
        <legend className="px-1 font-display text-2xl">{t("grapes")}</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {grapes.map((g) => {
            const cur = d.grapes.find((x) => x.slug === g.slug);
            return (
              <div key={g.slug} className="flex flex-wrap items-center gap-2 rounded-xl border border-line p-2.5 text-sm">
                <label className="flex flex-1 items-center gap-2"><input type="checkbox" name="grape" value={g.slug} defaultChecked={!!cur} className="h-4 w-4 accent-[#193C34]" />{g.name_hr}</label>
                <select name={`grape.${g.slug}.relation`} defaultValue={cur?.relation ?? "unknown"} className="rounded-lg border border-line bg-white px-1.5 py-1 text-xs" aria-label={`${g.name_hr} — ${tw("relation.unknown")}`}>
                  {(["grown", "purchased", "both", "unknown"] as const).map((r) => <option key={r} value={r}>{tw(`relation.${r}`)}</option>)}
                </select>
                <label className="flex items-center gap-1 text-xs"><input type="checkbox" name={`grape.${g.slug}.signature`} defaultChecked={cur?.is_signature} className="accent-[#792E39]" />{t("signature")}</label>
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
