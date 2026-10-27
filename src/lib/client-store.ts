"use client";

import { useSyncExternalStore } from "react";

/** Tiny localStorage-backed store with cross-tab sync. */
function createStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let cache: T | undefined;
  let cacheRaw: string | null | undefined;

  const read = (): T => {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    if (raw === cacheRaw && cache !== undefined) return cache;
    cacheRaw = raw;
    try { cache = raw ? (JSON.parse(raw) as T) : fallback; } catch { cache = fallback; }
    return cache!;
  };
  const write = (value: T) => {
    window.localStorage.setItem(key, JSON.stringify(value));
    listeners.forEach((l) => l());
  };
  const subscribe = (l: () => void) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => { if (e.key === key) l(); };
    window.addEventListener("storage", onStorage);
    return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
  };
  const useValue = () => useSyncExternalStore(subscribe, read, () => fallback);
  return { read, write, useValue };
}

export type RouteStopLite = { id: number; slug: string; name: string; town: string | null; lat: number | null; lng: number | null; precision?: string | null };

const routeStore = createStore<RouteStopLite[]>("atlas.route.v1", []);
const favStore = createStore<string[]>("atlas.favorites.v1", []);

export function useRoute() {
  const stops = routeStore.useValue();
  return {
    stops,
    has: (id: number) => stops.some((s) => s.id === id),
    add: (s: RouteStopLite) => { const cur = routeStore.read(); if (!cur.some((x) => x.id === s.id)) routeStore.write([...cur, s]); },
    remove: (id: number) => routeStore.write(routeStore.read().filter((s) => s.id !== id)),
    move: (id: number, dir: -1 | 1) => {
      const cur = [...routeStore.read()];
      const i = cur.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= cur.length) return;
      [cur[i], cur[j]] = [cur[j], cur[i]];
      routeStore.write(cur);
    },
    replace: (next: RouteStopLite[]) => routeStore.write(next),
    clear: () => routeStore.write([]),
  };
}

export function useLocalFavorites() {
  const favs = favStore.useValue();
  return {
    favs,
    has: (slug: string) => favs.includes(slug),
    toggle: (slug: string) => {
      const cur = favStore.read();
      favStore.write(cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]);
    },
    clear: () => favStore.write([]),
  };
}
