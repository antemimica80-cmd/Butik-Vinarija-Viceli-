"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FilterPanel } from "./FilterPanel";
import { ActiveFilters } from "./ActiveFilters";
import { Icon } from "../Icon";
import { filtersToParams, activeFilterCount, type WineryFilters } from "@/lib/filters";
import type { Facets } from "@/lib/queries/facets";

/** URL-driven filters for the server-rendered directory (crawlable, works without the map). */
export function DirectoryFilters({ filters, facets, total, mode }: { filters: WineryFilters; facets: Facets; total: number; mode: "sidebar" | "toolbar" }) {
  const t = useTranslations();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(false);

  const apply = (f: WineryFilters) => {
    const query = Object.fromEntries(filtersToParams(f).entries());
    start(() => router.replace({ pathname: "/wineries", query }, { scroll: false }));
  };
  const locate = () => {
    if (!("geolocation" in navigator)) { setLocError(true); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setLocating(false); apply({ ...filters, near: { lat: p.coords.latitude, lng: p.coords.longitude }, sort: "distance" }); },
      () => { setLocating(false); setLocError(true); },
      { timeout: 10000 },
    );
  };

  if (mode === "toolbar") {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-ghost btn-sm lg:hidden" onClick={() => setOpen(true)} aria-expanded={open}>
            <Icon name="filter" size={16} /> {t("common.filters")}{activeFilterCount(filters) > 0 && ` (${activeFilterCount(filters)})`}
          </button>
          <p className="text-sm font-medium" aria-live="polite">{pending ? t("common.loading") : t("common.wineriesCount", { count: total })}</p>
          <label className="ml-auto flex items-center gap-2 text-sm text-stone-700">
            {t("filters.sort")}
            <select className="field !min-h-9 !w-auto !py-1 text-sm" value={filters.sort ?? "relevance"} onChange={(e) => apply({ ...filters, sort: e.target.value as WineryFilters["sort"], page: undefined })}>
              <option value="relevance">{t("filters.sortRelevance")}</option>
              <option value="name">{t("filters.sortName")}</option>
              {filters.near && <option value="distance">{t("filters.sortDistance")}</option>}
              <option value="founded">{t("filters.sortFounded")}</option>
              <option value="featured">{t("filters.sortFeatured")}</option>
            </select>
          </label>
        </div>
        <ActiveFilters filters={filters} facets={facets} onChange={apply} />
        {open && (
          <div className="fixed inset-0 z-[60] flex flex-col bg-ivory lg:hidden" role="dialog" aria-modal="true" aria-label={t("filters.title")}>
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="font-display text-2xl">{t("filters.title")}</h2>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full" onClick={() => setOpen(false)} aria-label={t("common.close")}><Icon name="x" /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4"><FilterPanel filters={filters} facets={facets} onChange={apply} onLocate={locate} locating={locating} locationError={locError} /></div>
            <div className="border-t border-line p-3"><button type="button" className="btn btn-primary w-full" onClick={() => setOpen(false)}>{t("filters.showResults", { count: total })}</button></div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={pending ? "opacity-70 transition-opacity" : ""}>
      <h2 className="mb-2 font-display text-2xl">{t("filters.title")}</h2>
      <FilterPanel filters={filters} facets={facets} onChange={apply} onLocate={locate} locating={locating} locationError={locError} />
    </div>
  );
}
