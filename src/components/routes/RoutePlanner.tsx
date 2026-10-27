"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, getPathname } from "@/i18n/navigation";
import { Icon } from "../Icon";
import { MapCanvas, type MarkerFC } from "../map/MapCanvas";
import { useRoute, type RouteStopLite } from "@/lib/client-store";
import { saveRoute } from "@/app/actions/routes";
import type { Locale } from "@/i18n/routing";
import type * as GeoJSON from "geojson";

type Leg = { duration: number; distance: number };
type RouteResp = { enabled: boolean; geometry?: GeoJSON.LineString; legs?: Leg[]; duration?: number; distance?: number; error?: string };

export function RoutePlanner({ loggedIn, sharedSlugs }: { loggedIn: boolean; sharedSlugs: string[] }) {
  const t = useTranslations("routes");
  const tc = useTranslations("common");
  const tm = useTranslations("map");
  const tp = useTranslations("precision");
  const locale = useLocale() as Locale;
  const route = useRoute();
  const stops = route.stops;
  const [routing, setRouting] = useState<RouteResp | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RouteStopLite[]>([]);
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // Load a shared route (?stops=slug,slug).
  useEffect(() => {
    if (!sharedSlugs.length) return;
    fetch(`/api/wineries/lookup?slugs=${sharedSlugs.join(",")}`).then((r) => r.json()).then((d: { items: RouteStopLite[] }) => {
      if (d.items.length) route.replace(d.items.map((i) => ({ id: i.id, slug: i.slug, name: i.name, town: i.town, lat: i.lat, lng: i.lng, precision: i.precision })));
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Search wineries to add.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/wineries?q=${encodeURIComponent(q)}&pageSize=6`, { signal: ctrl.signal }).then((r) => r.json())
        .then((d: { items: RouteStopLite[] }) => setResults(d.items.map((i) => ({ id: i.id, slug: i.slug, name: i.name, town: i.town, lat: i.lat, lng: i.lng, precision: i.precision }))))
        .catch(() => {});
    }, 180);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [query]);

  const located = stops.filter((s) => s.lat != null && s.lng != null);
  const key = located.map((s) => s.id).join(",");
  useEffect(() => {
    if (located.length < 2) return;
    fetch("/api/route", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ coords: located.map((s) => [s.lng, s.lat]) }) })
      .then((r) => r.json()).then(setRouting).catch(() => setRouting({ enabled: true, error: "unavailable" }));
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const shownResults = query.trim().length >= 2 ? results : [];
  const shownRouting = located.length >= 2 ? routing : null;
  const markers = useMemo<MarkerFC>(() => ({
    type: "FeatureCollection",
    features: located.map((s) => ({ type: "Feature", id: s.id, geometry: { type: "Point", coordinates: [s.lng!, s.lat!] }, properties: { id: s.id, slug: s.slug, name: s.name, color: "#792E39", region: null, town: s.town, precision: s.precision ?? "approximate" } })),
  }), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const fit = useMemo(() => {
    if (!located.length) return null;
    const xs = located.map((s) => s.lng!), ys = located.map((s) => s.lat!);
    return { bbox: [Math.min(...xs) - 0.1, Math.min(...ys) - 0.08, Math.max(...xs) + 0.1, Math.max(...ys) + 0.08] as [number, number, number, number], key };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const shareUrl = typeof window !== "undefined" && stops.length
    ? `${window.location.origin}${getPathname({ href: "/routes/planner", locale })}?stops=${stops.map((s) => s.slug).join(",")}` : "";
  const google = located.length >= 1
    ? (() => {
        const enc = (s: RouteStopLite) => encodeURIComponent(`${s.name}, ${s.town ?? ""}, Croatia`);
        const dest = located[located.length - 1];
        const mids = located.slice(0, -1);
        return `https://www.google.com/maps/dir/?api=1&destination=${enc(dest)}${mids.length ? `&waypoints=${mids.map(enc).join("%7C")}` : ""}&travelmode=driving`;
      })()
    : null;
  const anyApprox = stops.some((s) => s.precision === "settlement" || s.precision === "approximate");
  const fmtMin = (sec: number) => Math.round(sec / 60);
  const fmtKm = (m: number) => (m / 1000).toFixed(m < 10000 ? 1 : 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[26rem_1fr]">
      <div className="space-y-5">
        <div className="card p-5">
          <label htmlFor="add-stop" className="field-label">{t("addStop")}</label>
          <input id="add-stop" className="field" placeholder={t("addStopPlaceholder")} value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
          {shownResults.length > 0 && (
            <ul className="mt-2 divide-y divide-line rounded-xl border border-line bg-white">
              {shownResults.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                  <span className="min-w-0"><span className="block truncate font-medium">{r.name}</span><span className="text-xs text-stone-700">{r.town}</span></span>
                  <button type="button" className="btn btn-ghost btn-sm shrink-0" disabled={route.has(r.id)} onClick={() => { route.add(r); setQuery(""); }}>
                    <Icon name={route.has(r.id) ? "check" : "plus"} size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {stops.length === 0 ? (
          <div className="card topo-bg p-6 text-center">
            <p className="text-stone-700">{t("emptyRoute")}</p>
            <Link href="/map" className="btn btn-primary mt-4"><Icon name="map" size={16} /> {t("addWineries")}</Link>
          </div>
        ) : (
          <ol className="space-y-2" aria-label={t("plannerTitle")}>
            {stops.map((s, i) => (
              <li key={s.id}>
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-burgundy font-display text-lg text-ivory" aria-label={t("stopNumber", { n: i + 1 })}>{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <Link href={{ pathname: "/wineries/[slug]", params: { slug: s.slug } }} className="block truncate font-medium hover:text-forest">{s.name}</Link>
                    <span className="block truncate text-xs text-stone-700">{s.town}</span>
                  </span>
                  <span className="flex shrink-0 gap-0.5">
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-ivory disabled:opacity-30" disabled={i === 0} onClick={() => route.move(s.id, -1)} aria-label={`${t("moveUp")}: ${s.name}`}><Icon name="arrowUp" size={16} /></button>
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-ivory disabled:opacity-30" disabled={i === stops.length - 1} onClick={() => route.move(s.id, 1)} aria-label={`${t("moveDown")}: ${s.name}`}><Icon name="arrowDown" size={16} /></button>
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-burgundy hover:bg-burgundy-100" onClick={() => route.remove(s.id)} aria-label={`${t("remove")}: ${s.name}`}><Icon name="trash" size={16} /></button>
                  </span>
                </div>
                {shownRouting?.legs?.[i] && i < stops.length - 1 && (
                  <p className="ml-14 py-1 text-xs text-stone-700">{t("legDrive", { min: fmtMin(shownRouting.legs[i].duration), km: fmtKm(shownRouting.legs[i].distance) })}</p>
                )}
              </li>
            ))}
          </ol>
        )}

        {stops.length > 0 && (
          <div className="card space-y-4 p-5 text-sm">
            {shownRouting?.duration != null && shownRouting.distance != null && <p className="font-medium">{t("totalDrive", { min: fmtMin(shownRouting.duration), km: fmtKm(shownRouting.distance) })}</p>}
            <p className="flex items-start gap-2 text-stone-700"><Icon name="info" size={15} className="mt-0.5 shrink-0" />
              {shownRouting?.enabled === false ? t("routingOff") : shownRouting?.error ? t("routingError") : shownRouting?.geometry ? t("routingOn") : t("orderNote")}</p>
            {anyApprox && <p className="text-xs text-stone-700">{t("approximateNote")}</p>}
            <p className="text-xs text-stone-700">{t("visitNote")}</p>
            <div className="flex flex-wrap gap-2">
              {google && <a href={google} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm"><Icon name="compass" size={15} /> {t("navigate")}</a>}
              <button type="button" className="btn btn-ghost btn-sm" onClick={async () => { await navigator.clipboard?.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                <Icon name="share" size={15} /> {copied ? tc("linkCopied") : t("shareRoute")}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => route.clear()}><Icon name="trash" size={15} /> {t("clear")}</button>
            </div>
            <div className="border-t border-line pt-4">
              {loggedIn ? (
                saved ? <p className="text-forest">{t("savedRoute")} · <Link href="/account/routes" className="underline">{tc("viewAll")}</Link></p> : (
                  <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await saveRoute({ title: title || t("defaultName"), wineryIds: stops.map((s) => s.id) }); if (r.ok) setSaved(r.slug); }); }}>
                    <label className="sr-only" htmlFor="route-title">{t("routeName")}</label>
                    <input id="route-title" className="field !min-h-9 text-sm" placeholder={t("defaultName")} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
                    <button className="btn btn-wine btn-sm shrink-0" disabled={pending}>{t("saveRoute")}</button>
                  </form>
                )
              ) : <p className="text-stone-700"><Link href="/login" className="text-forest underline">{t("signInToSave")}</Link></p>}
            </div>
          </div>
        )}
      </div>
      <div className="h-[28rem] overflow-hidden rounded-[1.6rem] border border-line lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
        <MapCanvas markers={markers} selectedId={null} hoverId={null} onSelect={() => {}} fitBounds={fit}
          route={located.map((s) => ({ lng: s.lng!, lat: s.lat! }))} routeGeometry={shownRouting?.geometry ?? null}
          labels={{ openProfile: tm("openProfile"), unavailable: tm("mapUnavailable"), loading: tm("loadingMap"), mapLabel: t("plannerTitle"), approximate: tp("settlement"), basemap: tm("basemapUnavailable") }}
          profileHref={(slug) => getPathname({ href: { pathname: "/wineries/[slug]", params: { slug } }, locale })} />
      </div>
    </div>
  );
}
