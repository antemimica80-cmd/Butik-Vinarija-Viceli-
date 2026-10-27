"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import type * as GeoJSON from "geojson";
import type { GeoJSONSource, Map as MLMap, Popup as MLPopup, MapLayerMouseEvent } from "maplibre-gl";
import { MAP_STYLE_URL, CROATIA_BOUNDS } from "@/lib/site";

export type MarkerFC = GeoJSON.FeatureCollection<GeoJSON.Point, { id: number; slug: string; name: string; color: string; region: string | null; town: string | null; precision: string }>;

export type MapCanvasProps = {
  markers: MarkerFC;
  selectedId: number | null;
  hoverId: number | null;
  onSelect: (id: number | null) => void;
  /** Called after any camera movement; `user` is true when the visitor moved the map. */
  onViewChange?: (bounds: [number, number, number, number], user: boolean) => void;
  fitBounds?: { bbox: [number, number, number, number]; key: string | number } | null;
  userLocation?: { lat: number; lng: number } | null;
  route?: { lng: number; lat: number }[] | null;
  routeGeometry?: GeoJSON.LineString | null;
  labels: { openProfile: string; unavailable: string; loading: string; mapLabel: string; approximate: string; basemap?: string };
  profileHref: (slug: string) => string;
  interactiveList?: boolean;
  className?: string;
};

const SRC = "wineries";

export function MapCanvas(props: MapCanvasProps) {
  const { markers, selectedId, hoverId, onSelect, onViewChange, fitBounds, userLocation, route, routeGeometry, labels, profileHref, className = "" } = props;
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const popupRef = useRef<MLPopup | null>(null);
  const libRef = useRef<typeof import("maplibre-gl") | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [basemapMissing, setBasemapMissing] = useState(false);
  const cb = useRef({ onSelect, onViewChange, profileHref, labels });
  useEffect(() => { cb.current = { onSelect, onViewChange, profileHref, labels }; });
  const programmatic = useRef(false);

  // Initialise once.
  useEffect(() => {
    let cancelled = false;
    let map: MLMap | null = null;
    (async () => {
      try {
        const lib = await import("maplibre-gl");
        if (cancelled || !container.current) return;
        libRef.current = lib;
        // The worker is served from /public (copied by scripts/copy-vendor.mjs).
        if (!lib.getWorkerUrl()?.includes("/vendor/")) lib.setWorkerUrl(`${window.location.origin}/vendor/maplibre-gl-worker.mjs`);
        // Check the base-map style first; if it is unreachable, fall back to a plain background
        // so wineries remain visible and clickable.
        let style: string | object = MAP_STYLE_URL;
        let glyphs = true;
        try {
          const res = await fetch(MAP_STYLE_URL, { signal: AbortSignal.timeout(5000) });
          if (!res.ok) throw new Error(String(res.status));
        } catch {
          style = { version: 8, sources: {}, layers: [{ id: "bg", type: "background", paint: { "background-color": "#E9E4D8" } }] };
          glyphs = false;
          setBasemapMissing(true);
        }
        if (cancelled || !container.current) return;
        map = new lib.Map({
          container: container.current,
          style: style as string,
          bounds: CROATIA_BOUNDS,
          fitBoundsOptions: { padding: 24 },
          attributionControl: false,
          cooperativeGestures: false,
          maxZoom: 17,
          minZoom: 4,
        });
        mapRef.current = map;
        if (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_E2E === "1") (window as unknown as { __atlasMap?: MLMap }).__atlasMap = map;
        map.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");
        map.addControl(new lib.AttributionControl({ compact: true, customAttribution: "Croatian Wine Atlas" }), "bottom-right");
        map.on("error", (e) => {
          // Style or tile failures: keep the app usable and tell the visitor.
          if (!map?.isStyleLoaded() && String(e.error?.message ?? "").length) setFailed(true);
        });
        map.on("load", () => {
          if (!map) return;
          map.addSource(SRC, { type: "geojson", data: { type: "FeatureCollection", features: [] }, cluster: true, clusterRadius: 44, clusterMaxZoom: 11, promoteId: "id" });
          map.addSource("route", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
          map.addSource("me", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
          map.addLayer({ id: "route-line", type: "line", source: "route", filter: ["==", ["get", "kind"], "route"], paint: { "line-color": "#792E39", "line-width": 4, "line-opacity": 0.85 } });
          map.addLayer({ id: "route-order", type: "line", source: "route", filter: ["==", ["get", "kind"], "order"], paint: { "line-color": "#792E39", "line-width": 2.5, "line-opacity": 0.75, "line-dasharray": [2, 2] } });
          map.addLayer({ id: "clusters", type: "circle", source: SRC, filter: ["has", "point_count"],
            paint: {
              "circle-color": "#193C34", "circle-opacity": 0.92, "circle-stroke-color": "#F5F1E8", "circle-stroke-width": 2,
              "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 50, 26],
            } });
          if (glyphs) map.addLayer({ id: "cluster-count", type: "symbol", source: SRC, filter: ["has", "point_count"],
            layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 12, "text-font": ["Noto Sans Bold", "Open Sans Bold"] },
            paint: { "text-color": "#F5F1E8" } });
          map.addLayer({ id: "points-halo", type: "circle", source: SRC, filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-color": ["get", "color"], "circle-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.25, ["boolean", ["feature-state", "hover"], false], 0.18, 0],
              "circle-radius": ["case", ["boolean", ["feature-state", "selected"], false], 20, 16],
            } });
          map.addLayer({ id: "points", type: "circle", source: SRC, filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-color": ["get", "color"],
              "circle-radius": ["case", ["boolean", ["feature-state", "selected"], false], 10, ["boolean", ["feature-state", "hover"], false], 9, 7],
              "circle-stroke-color": "#FBF9F4", "circle-stroke-width": ["case", ["boolean", ["feature-state", "selected"], false], 3, 2],
            } });
          map.addLayer({ id: "me", type: "circle", source: "me", paint: { "circle-color": "#2563eb", "circle-radius": 7, "circle-stroke-color": "#fff", "circle-stroke-width": 3 } });

          // Authoritative region polygons, if any have been imported.
          fetch("/api/map/regions").then((r) => r.json()).then((fc: GeoJSON.FeatureCollection) => {
            if (!map || !fc.features?.length) return;
            map.addSource("regions", { type: "geojson", data: fc });
            map.addLayer({ id: "regions-fill", type: "fill", source: "regions", paint: { "fill-color": ["get", "color"], "fill-opacity": 0.08 } }, "clusters");
            map.addLayer({ id: "regions-line", type: "line", source: "regions", paint: { "line-color": ["get", "color"], "line-width": 1.2, "line-opacity": 0.6 } }, "clusters");
          }).catch(() => {});

          map.on("click", "clusters", async (e: MapLayerMouseEvent) => {
            const f = e.features?.[0];
            if (!f || !map) return;
            const src = map.getSource(SRC) as GeoJSONSource;
            const zoom = await src.getClusterExpansionZoom(f.properties.cluster_id as number);
            map.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom: zoom + 0.3 });
          });
          map.on("click", "points", (e: MapLayerMouseEvent) => {
            const f = e.features?.[0];
            if (f) cb.current.onSelect(Number(f.properties.id));
          });
          map.on("click", (e) => {
            const hit = map?.queryRenderedFeatures(e.point, { layers: ["points", "clusters"] });
            if (!hit?.length) cb.current.onSelect(null);
          });
          for (const layer of ["points", "clusters"]) {
            map.on("mouseenter", layer, () => { map!.getCanvas().style.cursor = "pointer"; });
            map.on("mouseleave", layer, () => { map!.getCanvas().style.cursor = ""; });
          }
          map.on("moveend", () => {
            if (!map) return;
            const b = map.getBounds();
            cb.current.onViewChange?.([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], !programmatic.current);
            programmatic.current = false;
          });
          setReady(true);
          const b = map.getBounds();
          cb.current.onViewChange?.([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], false);
        });
      } catch {
        setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      popupRef.current?.remove();
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Marker data.
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    (mapRef.current.getSource(SRC) as GeoJSONSource | undefined)?.setData(markers);
  }, [markers, ready]);

  // Hover state.
  const prevHover = useRef<number | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    if (prevHover.current != null) map.setFeatureState({ source: SRC, id: prevHover.current }, { hover: false });
    if (hoverId != null) map.setFeatureState({ source: SRC, id: hoverId }, { hover: true });
    prevHover.current = hoverId;
  }, [hoverId, ready]);

  // Selection: highlight, fly, popup (built with text nodes — never innerHTML).
  const prevSel = useRef<number | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!ready || !map || !lib) return;
    if (prevSel.current != null) map.setFeatureState({ source: SRC, id: prevSel.current }, { selected: false });
    popupRef.current?.remove();
    prevSel.current = selectedId;
    if (selectedId == null) return;
    map.setFeatureState({ source: SRC, id: selectedId }, { selected: true });
    const f = markers.features.find((x) => x.properties.id === selectedId);
    if (!f) return;
    const [lng, lat] = f.geometry.coordinates;
    if (!map.getBounds().contains([lng, lat]) || map.getZoom() < 9) {
      programmatic.current = true;
      map.easeTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 10), duration: 700 });
    }
    const el = document.createElement("div");
    el.className = "p-3 pr-9 min-w-[12rem]";
    const name = document.createElement("a");
    name.href = cb.current.profileHref(f.properties.slug);
    name.textContent = f.properties.name;
    name.className = "block font-display text-lg leading-tight text-forest hover:underline";
    const town = document.createElement("p");
    town.className = "mt-0.5 text-xs text-stone-700";
    town.textContent = f.properties.town ?? "";
    el.append(name, town);
    if (f.properties.precision === "settlement" || f.properties.precision === "approximate") {
      const note = document.createElement("p");
      note.className = "mt-1 text-[0.7rem] text-stone-700";
      note.textContent = cb.current.labels.approximate;
      el.append(note);
    }
    const link = document.createElement("a");
    link.href = cb.current.profileHref(f.properties.slug);
    link.className = "mt-2 inline-block text-sm font-medium text-burgundy underline underline-offset-4";
    link.textContent = cb.current.labels.openProfile;
    el.append(link);
    popupRef.current = new lib.Popup({ offset: 14, closeButton: true, maxWidth: "260px" }).setLngLat([lng, lat]).setDOMContent(el).addTo(map);
  }, [selectedId, ready, markers]);

  // Fit to given bounds.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !fitBounds) return;
    const [w, s, e, n] = fitBounds.bbox;
    programmatic.current = true;
    const pad = 0.05;
    map.fitBounds([[w - pad, s - pad], [e + pad, n + pad]], { padding: 48, maxZoom: 12, duration: 800 });
  }, [fitBounds?.key, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // User location dot.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    (map.getSource("me") as GeoJSONSource | undefined)?.setData({
      type: "FeatureCollection",
      features: userLocation ? [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [userLocation.lng, userLocation.lat] } }] : [],
    });
  }, [userLocation, ready]);

  // Route: real geometry from a routing service, or a dashed stop-order line.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const features: GeoJSON.Feature[] = [];
    if (routeGeometry) features.push({ type: "Feature", properties: { kind: "route" }, geometry: routeGeometry });
    else if (route && route.length > 1) features.push({ type: "Feature", properties: { kind: "order" }, geometry: { type: "LineString", coordinates: route.map((p) => [p.lng, p.lat]) } });
    (map.getSource("route") as GeoJSONSource | undefined)?.setData({ type: "FeatureCollection", features });
  }, [route, routeGeometry, ready]);

  return (
    <div className={`relative h-full w-full bg-[#e9e4d8] ${className}`}>
      <div ref={container} style={{ position: "absolute", inset: 0 }} role="region" aria-label={labels.mapLabel} />
      {!ready && !failed && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-stone-700">
          <span className="rounded-full bg-paper/90 px-4 py-2 shadow-soft">{labels.loading}</span>
        </div>
      )}
      {basemapMissing && !failed && (
        <p className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-paper/90 px-3 py-1 text-[0.7rem] text-stone-700 shadow-soft">{labels.basemap}</p>
      )}
      {failed && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <p className="max-w-xs rounded-2xl bg-paper px-5 py-4 text-sm text-stone-700 shadow-soft">{labels.unavailable}</p>
        </div>
      )}
    </div>
  );
}
