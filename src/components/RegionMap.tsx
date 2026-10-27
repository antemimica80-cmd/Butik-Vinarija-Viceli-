"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { MapCanvas, type MarkerFC } from "./map/MapCanvas";
import type { Locale } from "@/i18n/routing";

/** Map of the wineries matching a filter query (e.g. one region or subregion). */
export function RegionMap({ query }: { query: string }) {
  const t = useTranslations("map");
  const tp = useTranslations("precision");
  const locale = useLocale() as Locale;
  const [markers, setMarkers] = useState<MarkerFC>({ type: "FeatureCollection", features: [] });
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => { fetch(`/api/map/markers?${query}`).then((r) => r.json()).then(setMarkers).catch(() => {}); }, [query]);
  const fit = useMemo(() => {
    if (!markers.features.length) return null;
    const xs = markers.features.map((f) => f.geometry.coordinates[0]), ys = markers.features.map((f) => f.geometry.coordinates[1]);
    return { bbox: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] as [number, number, number, number], key: query + markers.features.length };
  }, [markers, query]);
  return (
    <MapCanvas markers={markers} selectedId={selected} hoverId={null} onSelect={setSelected} fitBounds={fit}
      labels={{ openProfile: t("openProfile"), unavailable: t("mapUnavailable"), loading: t("loadingMap"), mapLabel: t("title"), approximate: tp("settlement"), basemap: t("basemapUnavailable") }}
      profileHref={(slug) => getPathname({ href: { pathname: "/wineries/[slug]", params: { slug } }, locale })} />
  );
}
