"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "../Icon";
import { pick } from "@/lib/content";
import type { WineryFilters } from "@/lib/filters";
import type { Facets } from "@/lib/queries/facets";
import { CERTIFICATIONS, EXPERIENCE_KINDS, FACILITIES, MEDALS, SIZE_CATEGORIES, VISIT_LANGUAGES, WINE_TYPES } from "@/lib/constants";
import type { Locale } from "@/i18n/routing";

type Props = { filters: WineryFilters; facets: Facets; onChange: (f: WineryFilters) => void; onLocate?: () => void; locating?: boolean; locationError?: boolean };

function toggle(list: string[] | undefined, v: string): string[] | undefined {
  const cur = list ?? [];
  const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
  return next.length ? next : undefined;
}

function Section({ title, children, defaultOpen = false, count = 0 }: { title: string; children: ReactNode; defaultOpen?: boolean; count?: number }) {
  return (
    <details className="group border-b border-line py-1" open={defaultOpen || count > 0}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-[0.95rem] font-medium [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">{title}{count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-forest px-1.5 text-[0.7rem] text-ivory">{count}</span>}</span>
        <Icon name="chevronDown" size={18} className="text-stone-700 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-4 pb-4">{children}</div>
    </details>
  );
}

function ChipToggle({ active, onClick, children, color }: { active: boolean; onClick: () => void; children: ReactNode; color?: string }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.84rem] transition-colors ${
        active ? "border-forest bg-forest text-ivory" : "border-line bg-paper hover:border-stone"}`}>
      {color && <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />}
      {children}
    </button>
  );
}

function Check({ checked, onChange, children, count }: { checked: boolean; onChange: () => void; children: ReactNode; count?: number }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2.5 text-[0.9rem]">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-[#193C34]" />
      <span className="flex-1">{children}</span>
      {count != null && <span className="text-xs text-stone-700">{count}</span>}
    </label>
  );
}

export function FilterPanel({ filters: f, facets, onChange, onLocate, locating, locationError }: Props) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [grapeQuery, setGrapeQuery] = useState("");
  const set = (patch: Partial<WineryFilters>) => onChange({ ...f, ...patch, page: undefined });

  const subregions = useMemo(
    () => facets.subregions.filter((s) => !f.region?.length || f.region.includes(s.region_slug)),
    [facets.subregions, f.region],
  );
  const grapes = useMemo(() => {
    const q = grapeQuery.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
    const list = facets.grapes.filter((g) => g.count > 0 || f.grape?.includes(g.slug));
    if (!q) return list.slice(0, 14);
    return facets.grapes.filter((g) => `${g.name_hr} ${g.name_en}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").includes(q));
  }, [facets.grapes, grapeQuery, f.grape]);

  return (
    <div className="text-ink">
      <Section title={t("filters.geography")} defaultOpen count={(f.region?.length ?? 0) + (f.subregion?.length ?? 0) + (f.island?.length ?? 0) + (f.district?.length ?? 0)}>
        <div>
          <p className="field-label">{t("filters.region")}</p>
          <div className="flex flex-wrap gap-2">
            {facets.regions.map((r) => (
              <ChipToggle key={r.slug} active={!!f.region?.includes(r.slug)} color={r.color}
                onClick={() => set({ region: toggle(f.region, r.slug), subregion: undefined, district: undefined })}>
                {pick(r.name, locale)} <span className="opacity-60">{r.count}</span>
              </ChipToggle>
            ))}
          </div>
        </div>
        {subregions.length > 0 && (
          <div>
            <p className="field-label">{t("filters.subregion")}</p>
            <div className="grid gap-0.5">
              {subregions.map((s) => (
                <Check key={s.slug} checked={!!f.subregion?.includes(s.slug)} count={s.count} onChange={() => set({ subregion: toggle(f.subregion, s.slug) })}>
                  {pick(s.name, locale)}
                </Check>
              ))}
            </div>
          </div>
        )}
        {facets.islands.length > 0 && (
          <div>
            <p className="field-label">{t("filters.island")}</p>
            <div className="flex flex-wrap gap-2">
              {facets.islands.map((i) => (
                <ChipToggle key={i.slug} active={!!f.island?.includes(i.slug)} onClick={() => set({ island: toggle(f.island, i.slug) })}>{i.island}</ChipToggle>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="field-label">{t("filters.distance")}</p>
          {f.near ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip chip-forest"><Icon name="locate" size={14} /> {t("filters.locationActive")}</span>
              <select className="field !min-h-9 !w-auto !py-1 text-sm" value={f.radius ?? ""} aria-label={t("filters.distance")}
                onChange={(e) => set({ radius: e.target.value ? Number(e.target.value) : undefined })}>
                <option value="">{t("filters.anyRadius")}</option>
                {[10, 25, 50, 100].map((km) => <option key={km} value={km}>{t("filters.radius", { km })}</option>)}
              </select>
              <button type="button" className="text-sm text-burgundy underline" onClick={() => set({ near: undefined, radius: undefined, sort: f.sort === "distance" ? undefined : f.sort })}>{t("common.reset")}</button>
            </div>
          ) : (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onLocate} disabled={locating || !onLocate}>
              <Icon name="locate" size={16} /> {locating ? t("filters.locating") : t("filters.useMyLocation")}
            </button>
          )}
          {locationError && <p className="field-hint">{t("filters.locationDenied")}</p>}
        </div>
      </Section>

      <Section title={t("filters.wine")} count={(f.type?.length ?? 0) + (f.grape?.length ?? 0) + (f.indigenous ? 1 : 0) + (f.cert?.length ?? 0)}>
        <div>
          <p className="field-label">{t("filters.wineType")}</p>
          <div className="flex flex-wrap gap-2">
            {WINE_TYPES.filter((w) => w !== "other" && w !== "fortified").map((w) => (
              <ChipToggle key={w} active={!!f.type?.includes(w)} onClick={() => set({ type: toggle(f.type, w) })}>{t(`wineType.${w}`)}</ChipToggle>
            ))}
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="grape-filter">{t("filters.grape")}</label>
          <input id="grape-filter" className="field !min-h-10 text-sm" placeholder={t("filters.grapeSearch")} value={grapeQuery} onChange={(e) => setGrapeQuery(e.target.value)} />
          <div className="mt-2 grid gap-0.5">
            {grapes.map((g) => (
              <Check key={g.slug} checked={!!f.grape?.includes(g.slug)} count={g.count} onChange={() => set({ grape: toggle(f.grape, g.slug) })}>
                {locale === "hr" ? g.name_hr : g.name_en}
                {g.origin === "indigenous" && <span className="ml-1.5 text-[0.7rem] uppercase tracking-wider text-brass-700">{t("grapes.origin.indigenous")}</span>}
              </Check>
            ))}
          </div>
        </div>
        <Check checked={!!f.indigenous} onChange={() => set({ indigenous: f.indigenous ? undefined : true })}>{t("filters.indigenous")}</Check>
        <div>
          <p className="field-label">{t("filters.certification")}</p>
          <div className="flex flex-wrap gap-2">
            {CERTIFICATIONS.map((c) => <ChipToggle key={c} active={!!f.cert?.includes(c)} onClick={() => set({ cert: toggle(f.cert, c) })}>{t(`certification.${c}`)}</ChipToggle>)}
          </div>
        </div>
      </Section>

      <Section title={t("filters.visit")} count={(f.facility?.length ?? 0) + (f.lang?.length ?? 0) + (f.exp?.length ?? 0) + (f.priceMax !== undefined ? 1 : 0) + (f.group ? 1 : 0)}>
        <div className="grid gap-0.5">
          {FACILITIES.map((fac) => (
            <Check key={fac} checked={!!f.facility?.includes(fac)} onChange={() => set({ facility: toggle(f.facility, fac) })}>{t(`facility.${fac}`)}</Check>
          ))}
        </div>
        <div>
          <p className="field-label">{t("filters.experience")}</p>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_KINDS.filter((k) => k !== "other").map((k) => <ChipToggle key={k} active={!!f.exp?.includes(k)} onClick={() => set({ exp: toggle(f.exp, k) })}>{t(`experienceKind.${k}`)}</ChipToggle>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="f-price">{t("filters.priceMax")}</label>
            <input id="f-price" type="number" min={0} inputMode="numeric" className="field !min-h-10" value={f.priceMax ?? ""}
              onChange={(e) => set({ priceMax: e.target.value === "" ? undefined : Number(e.target.value) })} />
          </div>
          <div>
            <label className="field-label" htmlFor="f-group">{t("filters.groupSize")}</label>
            <input id="f-group" type="number" min={1} inputMode="numeric" className="field !min-h-10" value={f.group ?? ""}
              onChange={(e) => set({ group: e.target.value === "" ? undefined : Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <p className="field-label">{t("filters.languages")}</p>
          <div className="flex flex-wrap gap-2">
            {VISIT_LANGUAGES.slice(0, 6).map((l) => <ChipToggle key={l} active={!!f.lang?.includes(l)} onClick={() => set({ lang: toggle(f.lang, l) })}>{t(`language.${l}`)}</ChipToggle>)}
          </div>
        </div>
      </Section>

      <Section title={t("filters.winery")} count={(f.size?.length ?? 0) + (f.family ? 1 : 0) + (f.foundedFrom ? 1 : 0) + (f.foundedTo ? 1 : 0)}>
        <div className="flex flex-wrap gap-2">
          {SIZE_CATEGORIES.map((s) => <ChipToggle key={s} active={!!f.size?.includes(s)} onClick={() => set({ size: toggle(f.size, s) })}>{t(`size.${s}`)}</ChipToggle>)}
        </div>
        <Check checked={!!f.family} onChange={() => set({ family: f.family ? undefined : true })}>{t("filters.family")}</Check>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="f-from">{t("filters.foundedFrom")}</label>
            <input id="f-from" type="number" min={1000} max={2100} className="field !min-h-10" value={f.foundedFrom ?? ""} onChange={(e) => set({ foundedFrom: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
          <div>
            <label className="field-label" htmlFor="f-to">{t("filters.foundedTo")}</label>
            <input id="f-to" type="number" min={1000} max={2100} className="field !min-h-10" value={f.foundedTo ?? ""} onChange={(e) => set({ foundedTo: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
        </div>
      </Section>

      <Section title={t("filters.awards")} count={(f.awarded ? 1 : 0) + (f.competition?.length ?? 0) + (f.medal?.length ?? 0) + (f.awardYear ? 1 : 0)}>
        <Check checked={!!f.awarded} onChange={() => set({ awarded: f.awarded ? undefined : true })}>{t("filters.awarded")}</Check>
        <div>
          <p className="field-label">{t("filters.competition")}</p>
          <div className="grid gap-0.5">
            {facets.competitions.map((c) => <Check key={c.slug} checked={!!f.competition?.includes(c.slug)} onChange={() => set({ competition: toggle(f.competition, c.slug) })}>{c.name}</Check>)}
          </div>
        </div>
        <div>
          <p className="field-label">{t("filters.medal")}</p>
          <div className="flex flex-wrap gap-2">
            {MEDALS.filter((m) => m !== "other").map((m) => <ChipToggle key={m} active={!!f.medal?.includes(m)} onClick={() => set({ medal: toggle(f.medal, m) })}>{t(`medal.${m}`)}</ChipToggle>)}
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="f-year">{t("filters.awardYear")}</label>
          <input id="f-year" type="number" min={1950} max={2100} className="field !min-h-10" value={f.awardYear ?? ""} onChange={(e) => set({ awardYear: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
      </Section>
      <p className="mt-4 flex gap-2 text-xs leading-relaxed text-stone-700"><Icon name="info" size={14} className="mt-0.5 shrink-0" />{t("filters.dataNote")}</p>
    </div>
  );
}
