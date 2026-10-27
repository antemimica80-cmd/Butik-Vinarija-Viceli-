"use client";

import { useLocale, useTranslations } from "next-intl";
import { Icon } from "../Icon";
import { pick } from "@/lib/content";
import { activeFilterCount, type WineryFilters } from "@/lib/filters";
import type { Facets } from "@/lib/queries/facets";
import type { Locale } from "@/i18n/routing";

type Chip = { key: string; label: string; remove: () => WineryFilters };

export function ActiveFilters({ filters: f, facets, onChange, className = "" }: { filters: WineryFilters; facets: Facets; onChange: (f: WineryFilters) => void; className?: string }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const chips: Chip[] = [];
  const without = <K extends keyof WineryFilters>(k: K, v?: string): WineryFilters => {
    const next = { ...f, page: undefined };
    const cur = next[k];
    if (Array.isArray(cur) && v !== undefined) {
      const arr = (cur as string[]).filter((x) => x !== v);
      (next as Record<string, unknown>)[k] = arr.length ? arr : undefined;
    } else delete next[k];
    return next;
  };
  if (f.q) chips.push({ key: "q", label: `“${f.q}”`, remove: () => without("q") });
  f.region?.forEach((s) => chips.push({ key: `r${s}`, label: pick(facets.regions.find((r) => r.slug === s)?.name, locale) || s, remove: () => without("region", s) }));
  f.subregion?.forEach((s) => chips.push({ key: `s${s}`, label: pick(facets.subregions.find((r) => r.slug === s)?.name, locale) || s, remove: () => without("subregion", s) }));
  f.district?.forEach((s) => chips.push({ key: `d${s}`, label: pick(facets.districts.find((r) => r.slug === s)?.name, locale) || s, remove: () => without("district", s) }));
  if (f.site) chips.push({ key: "site", label: f.site, remove: () => without("site") });
  f.island?.forEach((s) => chips.push({ key: `i${s}`, label: facets.islands.find((r) => r.slug === s)?.island ?? s, remove: () => without("island", s) }));
  if (f.town) chips.push({ key: "town", label: f.town, remove: () => without("town") });
  f.grape?.forEach((s) => {
    const g = facets.grapes.find((x) => x.slug === s);
    chips.push({ key: `g${s}`, label: g ? (locale === "hr" ? g.name_hr : g.name_en) : s, remove: () => without("grape", s) });
  });
  f.type?.forEach((s) => chips.push({ key: `t${s}`, label: t(`wineType.${s as "red"}`), remove: () => without("type", s) }));
  if (f.indigenous) chips.push({ key: "ind", label: t("filters.indigenous"), remove: () => without("indigenous") });
  f.cert?.forEach((s) => chips.push({ key: `c${s}`, label: t(`certification.${s as "organic"}`), remove: () => without("cert", s) }));
  f.size?.forEach((s) => chips.push({ key: `z${s}`, label: t(`size.${s as "boutique"}`), remove: () => without("size", s) }));
  if (f.family) chips.push({ key: "fam", label: t("filters.family"), remove: () => without("family") });
  if (f.foundedFrom) chips.push({ key: "ff", label: `≥ ${f.foundedFrom}`, remove: () => without("foundedFrom") });
  if (f.foundedTo) chips.push({ key: "ft", label: `≤ ${f.foundedTo}`, remove: () => without("foundedTo") });
  f.facility?.forEach((s) => chips.push({ key: `f${s}`, label: t(`facility.${s as "tasting"}`), remove: () => without("facility", s) }));
  f.lang?.forEach((s) => chips.push({ key: `l${s}`, label: t(`language.${s as "hr"}`), remove: () => without("lang", s) }));
  f.exp?.forEach((s) => chips.push({ key: `e${s}`, label: t(`experienceKind.${s as "tasting"}`), remove: () => without("exp", s) }));
  if (f.priceMax !== undefined) chips.push({ key: "pm", label: `≤ €${f.priceMax}`, remove: () => without("priceMax") });
  if (f.group) chips.push({ key: "gr", label: `${t("filters.groupSize")}: ${f.group}`, remove: () => without("group") });
  if (f.awarded) chips.push({ key: "aw", label: t("filters.awarded"), remove: () => without("awarded") });
  f.competition?.forEach((s) => chips.push({ key: `co${s}`, label: facets.competitions.find((c) => c.slug === s)?.short_name ?? s, remove: () => without("competition", s) }));
  f.medal?.forEach((s) => chips.push({ key: `m${s}`, label: t(`medal.${s as "gold"}`), remove: () => without("medal", s) }));
  if (f.awardYear) chips.push({ key: "ay", label: String(f.awardYear), remove: () => without("awardYear") });
  if (f.near) chips.push({ key: "near", label: f.radius ? t("filters.radius", { km: f.radius }) : t("filters.locationActive"), remove: () => ({ ...without("near"), radius: undefined }) });
  if (f.bbox) chips.push({ key: "bbox", label: t("filters.mapArea"), remove: () => without("bbox") });
  if (f.featured) chips.push({ key: "feat", label: t("common.featured"), remove: () => without("featured") });

  if (!chips.length) return null;
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} aria-label={t("filters.active")}>
      {chips.map((c) => (
        <button key={c.key} type="button" onClick={() => onChange(c.remove())}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-forest-100 py-1 pl-3 pr-2 text-[0.8rem] text-forest hover:bg-forest hover:text-ivory">
          {c.label} <Icon name="x" size={13} />
          <span className="sr-only">({t("common.reset")})</span>
        </button>
      ))}
      {activeFilterCount(f) > 1 && (
        <button type="button" onClick={() => onChange({ sort: f.sort })} className="text-[0.8rem] font-medium text-burgundy underline underline-offset-4">
          {t("filters.clearAll")}
        </button>
      )}
    </div>
  );
}
