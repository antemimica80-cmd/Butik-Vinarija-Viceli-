"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { MapCanvas, type MarkerFC } from "../map/MapCanvas";
import type { Locale } from "@/i18n/routing";

/** Read-only map of a route's stops, connected in order (not driving directions). */
export function RouteMap({ stops }: { stops: { winery_id: number; slug: string; name: string; town: string | null; lat: number; lng: number; precision: string; region_color: string | null }[] }) {
  const t = useTranslations("map");
  const tp = useTranslations("precision");
  const locale = useLocale() as Locale;
  const markers = useMemo<MarkerFC>(() => ({
    type: "FeatureCollection",
    features: stops.map((s) => ({ type: "Feature", id: s.winery_id, geometry: { type: "Point", coordinates: [s.lng, s.lat] }, properties: { id: s.winery_id, slug: s.slug, name: s.name, color: s.region_color ?? "#792E39", region: null, town: s.town, precision: s.precision } })),
  }), [stops]);
  const xs = stops.map((s) => s.lng), ys = stops.map((s) => s.lat);
  return (
    <MapCanvas markers={markers} selectedId={null} hoverId={null} onSelect={() => {}}
      fitBounds={stops.length ? { bbox: [Math.min(...xs) - 0.08, Math.min(...ys) - 0.06, Math.max(...xs) + 0.08, Math.max(...ys) + 0.06], key: stops.map((s) => s.slug).join() } : null}
      route={stops.map((s) => ({ lng: s.lng, lat: s.lat }))}
      labels={{ openProfile: t("openProfile"), unavailable: t("mapUnavailable"), loading: t("loadingMap"), mapLabel: t("title"), approximate: tp("settlement"), basemap: t("basemapUnavailable") }}
      profileHref={(slug) => getPathname({ href: { pathname: "/wineries/[slug]", params: { slug } }, locale })} />
  );
}
