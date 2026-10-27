"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { MapCanvas, type MarkerFC } from "./MapCanvas";
import type { Locale } from "@/i18n/routing";

/** Homepage atlas: a real, interactive map of every listed winery. */
export function AtlasPreview() {
  const t = useTranslations("map");
  const tp = useTranslations("precision");
  const locale = useLocale() as Locale;
  const [markers, setMarkers] = useState<MarkerFC>({ type: "FeatureCollection", features: [] });
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/map/markers").then((r) => r.json()).then(setMarkers).catch(() => {});
  }, []);
  return (
    <MapCanvas
      markers={markers}
      selectedId={selected}
      hoverId={null}
      onSelect={setSelected}
      labels={{ openProfile: t("openProfile"), unavailable: t("mapUnavailable"), loading: t("loadingMap"), mapLabel: t("title"), approximate: tp("settlement"), basemap: t("basemapUnavailable") }}
      profileHref={(slug) => getPathname({ href: { pathname: "/wineries/[slug]", params: { slug } }, locale })}
    />
  );
}
