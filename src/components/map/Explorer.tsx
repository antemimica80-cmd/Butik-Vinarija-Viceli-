"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, getPathname } from "@/i18n/navigation";
import { Icon } from "../Icon";
import { WineryCard, type CardWinery } from "../WineryCard";
import { FilterPanel } from "../filters/FilterPanel";
import { ActiveFilters } from "../filters/ActiveFilters";
import { MapCanvas, type MarkerFC } from "./MapCanvas";
import { BottomSheet } from "./BottomSheet";
import { filtersToParams, activeFilterCount, type WineryFilters } from "@/lib/filters";
import type { Facets } from "@/lib/queries/facets";
import { pick } from "@/lib/content";
import { useRoute } from "@/lib/client-store";
import type { Locale } from "@/i18n/routing";

type ListResult = { items: (CardWinery & { lat: number | null; lng: number | null; precision: string | null })[]; total: number; page: number; pageSize: number };

export function Explorer({ initialFilters, initialResults, facets, autoLocate = false }: { initialFilters: WineryFilters; initialResults: ListResult; facets: Facets; autoLocate?: boolean }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const route = useRoute();
  const [filters, setFilters] = useState<WineryFilters>(initialFilters);
  const [results, setResults] = useState<ListResult>(initialResults);
  const [loading, setLoading] = useState(false);
  const [markers, setMarkers] = useState<MarkerFC>({ type: "FeatureCollection", features: [] });
  const [selected, setSelected] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [panel, setPanel] = useState<"list" | "filters">("list");
  const [view, setView] = useState<[number, number, number, number] | null>(null);
  const [areaDirty, setAreaDirty] = useState(false);
  const [fit, setFit] = useState<{ bbox: [number, number, number, number]; key: string | number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(false);
  const [snap, setSnap] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const query = useMemo(() => filtersToParams(filters).toString(), [filters]);

  // Results list (server-side filtering & pagination).
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/wineries?${query}`, { signal: ctrl.signal })
      .then((r) => r.json()).then((d: ListResult) => setResults(d)).catch(() => {}).finally(() => setLoading(false));
    // Keep the URL shareable without a server round trip.
    const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState(window.history.state, "", url);
    return () => ctrl.abort();
  }, [query]);

  // Markers for the current viewport + filters.
  useEffect(() => {
    if (!view) return;
    const ctrl = new AbortController();
    const p = filtersToParams({ ...filters, page: undefined });
    const pad = 0.5;
    p.set("view", [view[0] - pad, view[1] - pad, view[2] + pad, view[3] + pad].map((n) => n.toFixed(3)).join(","));
    const timer = setTimeout(() => {
      fetch(`/api/map/markers?${p}`, { signal: ctrl.signal }).then((r) => r.json()).then(setMarkers).catch(() => {});
    }, 150);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [query, view]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback((f: WineryFilters) => {
    setFilters((prev) => {
      // Fit the map when the region selection changes (done here, in the event, not in an effect).
      const key = (f.region ?? []).join(",");
      if (key && key !== (prev.region ?? []).join(",")) {
        const boxes = (f.region ?? []).map((s) => facets.regions.find((r) => r.slug === s)?.bbox).filter(Boolean) as [number, number, number, number][];
        if (boxes.length) {
          setFit({ bbox: [Math.min(...boxes.map((b) => b[0])), Math.min(...boxes.map((b) => b[1])), Math.max(...boxes.map((b) => b[2])), Math.max(...boxes.map((b) => b[3]))], key });
        }
      }
      return f;
    });
    setAreaDirty(false);
  }, [facets.regions]);

  // Scroll selected item into view in the list.
  useEffect(() => {
    if (selected == null) return;
    listRef.current?.querySelector(`[data-winery-id="${selected}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);

  const select = useCallback((id: number | null) => {
    setSelected(id);
    if (id != null && window.matchMedia("(max-width: 1023px)").matches) setSnap((s) => (s === 0 ? 1 : s));
  }, []);

  // "Wineries near me" shortcut: ask for location only after the visitor's explicit click.
  useEffect(() => {
    if (autoLocate) locate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onFs = () => setIsFull(document.fullscreenElement === shell.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  function locate() {
    if (!("geolocation" in navigator)) { setLocError(true); return; }
    setLocating(true); setLocError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const near = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        update({ ...filters, near, sort: "distance", page: undefined });
        setFit({ bbox: [near.lng - 0.6, near.lat - 0.4, near.lng + 0.6, near.lat + 0.4], key: `me-${Date.now()}` });
      },
      () => { setLocating(false); setLocError(true); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  const selectedItem = results.items.find((i) => i.id === selected) ?? null;
  const selectedMarker = markers.features.find((f) => f.properties.id === selected)?.properties ?? null;
  const pages = Math.max(1, Math.ceil(results.total / results.pageSize));
  const nActive = activeFilterCount(filters);
  const profileHref = useCallback((slug: string) => getPathname({ href: { pathname: "/wineries/[slug]", params: { slug } }, locale }), [locale]);

  const sortSelect = (
    <label className="flex items-center gap-2 text-sm text-stone-700">
      <span className="sr-only sm:not-sr-only">{t("filters.sort")}</span>
      <select className="field !min-h-9 !w-auto !py-1 text-sm" value={filters.sort ?? "relevance"} onChange={(e) => update({ ...filters, sort: e.target.value as WineryFilters["sort"], page: undefined })}>
        <option value="relevance">{t("filters.sortRelevance")}</option>
        <option value="name">{t("filters.sortName")}</option>
        {filters.near && <option value="distance">{t("filters.sortDistance")}</option>}
        <option value="founded">{t("filters.sortFounded")}</option>
        <option value="featured">{t("filters.sortFeatured")}</option>
      </select>
    </label>
  );

  const searchField = (
    <form role="search" onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget).get("q")?.toString().trim(); update({ ...filters, q: q || undefined, page: undefined }); }}
      className="flex items-center gap-2 rounded-full border border-line bg-paper py-1 pl-4 pr-1 focus-within:border-forest">
      <Icon name="search" size={18} className="text-stone-700" />
      <label className="sr-only" htmlFor="explorer-q">{t("search.label")}</label>
      <input id="explorer-q" name="q" type="search" defaultValue={filters.q ?? ""} key={filters.q ?? ""} placeholder={t("search.placeholder")}
        className="h-10 min-w-0 flex-1 bg-transparent text-[0.95rem] focus:outline-none" />
      <button className="btn btn-primary btn-sm" type="submit">{t("search.submit")}</button>
    </form>
  );

  const list = (
    <div ref={listRef} aria-busy={loading} className="space-y-1">
      <p className="sr-only" aria-live="polite">{t("common.results", { count: results.total })}</p>
      {results.items.length === 0 && !loading && (
        <div className="px-2 py-10 text-center">
          <p className="font-display text-2xl text-forest">{t("filters.noResultsTitle")}</p>
          <p className="mt-2 text-sm text-stone-700">{t("filters.noResultsBody")}</p>
        </div>
      )}
      {results.items.map((w) => (
        <div key={w.id} onClick={(e) => { if (!(e.target as HTMLElement).closest("a")) select(w.id); }}>
          <WineryCard w={w} variant="compact" selected={w.id === selected} onHover={setHover} />
        </div>
      ))}
      {pages > 1 && (
        <nav className="flex items-center justify-between px-2 pt-3 text-sm" aria-label="Pagination">
          <button type="button" className="btn btn-ghost btn-sm" disabled={results.page <= 1} onClick={() => update({ ...filters, page: results.page - 1 })}>
            <Icon name="chevronLeft" size={16} /> {t("common.previous")}
          </button>
          <span className="text-stone-700">{t("common.pageOf", { page: results.page, pages })}</span>
          <button type="button" className="btn btn-ghost btn-sm" disabled={results.page >= pages} onClick={() => update({ ...filters, page: results.page + 1 })}>
            {t("common.next")} <Icon name="chevronRight" size={16} />
          </button>
        </nav>
      )}
    </div>
  );

  const preview = selected != null && (selectedItem || selectedMarker) && (
    <div className="pointer-events-auto rounded-2xl border border-line bg-paper p-4 shadow-lift fade-up">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{t("map.selected")}</p>
          <h3 className="mt-1 font-display text-2xl leading-tight text-forest">{selectedItem?.name ?? selectedMarker?.name}</h3>
          <p className="mt-0.5 text-sm text-stone-700">{selectedItem?.town ?? selectedMarker?.town}{selectedItem ? ` · ${pick(selectedItem.region_name, locale)}` : ""}</p>
        </div>
        <button type="button" onClick={() => setSelected(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-ivory" aria-label={t("common.close")}><Icon name="x" size={18} /></button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={{ pathname: "/wineries/[slug]", params: { slug: (selectedItem?.slug ?? selectedMarker?.slug)! } }} className="btn btn-primary btn-sm">{t("map.openProfile")}</Link>
        {(() => {
          const id = selected;
          const inRoute = route.has(id);
          const src = selectedItem ?? null;
          const m = selectedMarker;
          const lat = src?.lat ?? (m ? markers.features.find((f) => f.properties.id === id)?.geometry.coordinates[1] ?? null : null);
          const lng = src?.lng ?? (m ? markers.features.find((f) => f.properties.id === id)?.geometry.coordinates[0] ?? null : null);
          return (
            <button type="button" className="btn btn-ghost btn-sm" aria-pressed={inRoute}
              onClick={() => inRoute ? route.remove(id) : route.add({ id, slug: (src?.slug ?? m?.slug)!, name: (src?.name ?? m?.name)!, town: src?.town ?? m?.town ?? null, lat, lng, precision: src?.precision ?? m?.precision })}>
              <Icon name={inRoute ? "check" : "route"} size={16} /> {inRoute ? t("winery.inRoute") : t("winery.addToRoute")}
            </button>
          );
        })()}
        <Link href={{ pathname: "/wineries/[slug]/inquiry", params: { slug: (selectedItem?.slug ?? selectedMarker?.slug)! } }} className="btn btn-ghost btn-sm">{t("winery.requestTasting")}</Link>
      </div>
    </div>
  );

  const header = (
    <div className="space-y-3 border-b border-line p-4">
      {searchField}
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => { if (window.matchMedia("(max-width: 1023px)").matches) setMobileFilters(true); else setPanel(panel === "filters" ? "list" : "filters"); }}
          className={`btn btn-sm ${panel === "filters" ? "btn-primary" : "btn-ghost"}`} aria-expanded={panel === "filters" || mobileFilters}>
          <Icon name="filter" size={16} /> {t("common.filters")}{nActive > 0 && ` (${nActive})`}
        </button>
        <p className="text-sm font-medium" aria-live="polite">{loading ? t("common.loading") : t("common.wineriesCount", { count: results.total })}</p>
        <div className="hidden sm:block">{sortSelect}</div>
      </div>
      <ActiveFilters filters={filters} facets={facets} onChange={update} />
    </div>
  );

  return (
    <div ref={shell} className="relative flex h-[calc(100dvh-4rem)] bg-ivory md:h-[calc(100dvh-4.5rem)]">
      {/* Desktop side panel */}
      <aside className="hidden w-[26rem] shrink-0 flex-col border-r border-line bg-ivory lg:flex xl:w-[28rem]">
        {header}
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {panel === "filters" ? (
            <div className="px-1">
              <FilterPanel filters={filters} facets={facets} onChange={update} onLocate={locate} locating={locating} locationError={locError} />
              <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => setPanel("list")}>{t("filters.showResults", { count: results.total })}</button>
            </div>
          ) : list}
        </div>
      </aside>

      {/* Map */}
      <div className="relative min-w-0 flex-1">
        <MapCanvas
          markers={markers}
          selectedId={selected}
          hoverId={hover}
          onSelect={select}
          onViewChange={(b, user) => { setView(b); if (user) setAreaDirty(true); }}
          fitBounds={fit}
          userLocation={filters.near ?? null}
          labels={{ openProfile: t("map.openProfile"), unavailable: t("map.mapUnavailable"), loading: t("map.loadingMap"), mapLabel: t("map.title"), approximate: t("precision.settlement"), basemap: t("map.basemapUnavailable") }}
          profileHref={profileHref}
        />
        <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-14">
          {areaDirty && view && (
            <button type="button" className="btn btn-sm pointer-events-auto bg-paper shadow-lift" onClick={() => { update({ ...filters, bbox: view, page: undefined }); }}>
              <Icon name="search" size={15} /> {t("filters.searchThisArea")}
            </button>
          )}
        </div>
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          <button type="button" onClick={locate} className="grid h-10 w-10 place-items-center rounded-xl bg-paper shadow-soft hover:bg-white" aria-label={t("map.locateMe")} title={t("map.locateMe")}>
            <Icon name="locate" size={18} />
          </button>
          <button type="button" className="hidden h-10 w-10 place-items-center rounded-xl bg-paper shadow-soft hover:bg-white sm:grid"
            onClick={() => { if (document.fullscreenElement) document.exitFullscreen(); else shell.current?.requestFullscreen?.(); }}
            aria-label={isFull ? t("map.exitFullscreen") : t("map.fullscreen")} title={isFull ? t("map.exitFullscreen") : t("map.fullscreen")}>
            <Icon name="expand" size={18} />
          </button>
        </div>
        {/* Legend */}
        <div className="absolute bottom-8 left-3 z-10 hidden max-w-[17rem] rounded-2xl bg-paper/95 p-3 text-xs shadow-soft lg:block">
          <p className="mb-2 font-medium">{t("map.regionsLegend")}</p>
          <ul className="space-y-1.5">
            {facets.regions.map((r) => (
              <li key={r.slug}>
                <button type="button" className="flex items-center gap-2 text-left hover:text-forest" onClick={() => update({ ...filters, region: [r.slug], subregion: undefined, page: undefined })}
                  aria-label={t("map.zoomToRegion", { region: pick(r.name, locale) })}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} /> {pick(r.name, locale)} <span className="text-stone-700">({r.count})</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 leading-snug text-stone-700">{t("map.boundariesNote")}</p>
        </div>
        {/* Desktop preview panel */}
        <div className="pointer-events-none absolute bottom-8 right-14 z-10 hidden w-[22rem] lg:block">{preview}</div>

        {/* Mobile bottom sheet */}
        <div className="lg:hidden">
          <BottomSheet handleLabel={t("map.dragHandle")} snap={snap} onSnap={setSnap}>
            {preview && <div className="px-3 pb-2">{preview}</div>}
            {header}
            <div className="p-2">{list}</div>
          </BottomSheet>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-ivory lg:hidden" role="dialog" aria-modal="true" aria-label={t("filters.title")}>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="font-display text-2xl">{t("filters.title")}</h2>
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full hover:bg-paper" onClick={() => setMobileFilters(false)} aria-label={t("common.close")}><Icon name="x" /></button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4">
            <div className="py-3 sm:hidden">{sortSelect}</div>
            <FilterPanel filters={filters} facets={facets} onChange={update} onLocate={locate} locating={locating} locationError={locError} />
          </div>
          <div className="flex gap-2 border-t border-line p-3">
            <button type="button" className="btn btn-ghost" onClick={() => update({})}>{t("filters.clearAll")}</button>
            <button type="button" className="btn btn-primary flex-1" onClick={() => setMobileFilters(false)}>{t("filters.showResults", { count: results.total })}</button>
          </div>
        </div>
      )}
    </div>
  );
}
