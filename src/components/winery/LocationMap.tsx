"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { MapCanvas, type MarkerFC } from "../map/MapCanvas";
import type { Locale } from "@/i18n/routing";

export function LocationMap({ points, color }: { points: { id: number; slug: string; name: string; town: string | null; lat: number; lng: number; precision: string }[]; color: string }) {
  const t = useTranslations("map");
  const tp = useTranslations("precision");
  const locale = useLocale() as Locale;
  const markers = useMemo<MarkerFC>(() => ({
    type: "FeatureCollection",
    features: points.map((p) => ({ type: "Feature", id: p.id, geometry: { type: "Point", coordinates: [p.lng, p.lat] }, properties: { id: p.id, slug: p.slug, name: p.name, color, region: null, town: p.town, precision: p.precision } })),
  }), [points, color]);
  const lngs = points.map((p) => p.lng), lats = points.map((p) => p.lat);
  const pad = 0.12;
  return (
    <MapCanvas
      markers={markers}
      selectedId={null}
      hoverId={null}
      onSelect={() => {}}
      fitBounds={points.length ? { bbox: [Math.min(...lngs) - pad, Math.min(...lats) - pad, Math.max(...lngs) + pad, Math.max(...lats) + pad], key: points.map((p) => p.id).join(",") } : null}
      labels={{ openProfile: t("openProfile"), unavailable: t("mapUnavailable"), loading: t("loadingMap"), mapLabel: t("title"), approximate: tp("settlement"), basemap: t("basemapUnavailable") }}
      profileHref={(slug) => getPathname({ href: { pathname: "/wineries/[slug]", params: { slug } }, locale })}
    />
  );
}
