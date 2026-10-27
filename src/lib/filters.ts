import { CERTIFICATIONS, EXPERIENCE_KINDS, FACILITIES, MEDALS, SIZE_CATEGORIES, WINE_TYPES } from "./constants";

/** All winery discovery filters. Every value is shareable through the URL. */
export type WineryFilters = {
  q?: string;
  region?: string[];
  subregion?: string[];
  district?: string[];
  site?: string;
  island?: string[];
  town?: string;
  grape?: string[];
  type?: string[];
  indigenous?: boolean;
  cert?: string[];
  size?: string[];
  family?: boolean;
  foundedFrom?: number;
  foundedTo?: number;
  facility?: string[];
  lang?: string[];
  competition?: string[];
  medal?: string[];
  awardYear?: number;
  awarded?: boolean;
  exp?: string[];
  priceMax?: number;
  group?: number;
  durationMax?: number;
  near?: { lat: number; lng: number };
  radius?: number;
  bbox?: [number, number, number, number];
  sort?: "relevance" | "name" | "distance" | "founded" | "featured";
  featured?: boolean;
  page?: number;
  /** Internal only (never parsed from URLs): restrict to these slugs. */
  slugs?: string[];
};

type SP = URLSearchParams | Record<string, string | string[] | undefined>;

function get(sp: SP, key: string): string | undefined {
  if (sp instanceof URLSearchParams) return sp.get(key) ?? undefined;
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

const slugRe = /^[a-z0-9-]{1,80}$/;
function list(sp: SP, key: string, allowed?: readonly string[]): string[] | undefined {
  const raw = get(sp, key);
  if (!raw) return undefined;
  const items = raw.split(",").map((s) => s.trim()).filter((s) => s && slugRe.test(s) && (!allowed || allowed.includes(s)));
  return items.length ? Array.from(new Set(items)).slice(0, 20) : undefined;
}
function num(sp: SP, key: string, min: number, max: number): number | undefined {
  const raw = get(sp, key);
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= min && n <= max ? n : undefined;
}
const bool = (sp: SP, key: string) => (get(sp, key) === "1" ? true : undefined);

export function parseFilters(sp: SP): WineryFilters {
  const f: WineryFilters = {};
  const q = get(sp, "q")?.trim().slice(0, 120);
  if (q) f.q = q;
  f.region = list(sp, "region");
  f.subregion = list(sp, "subregion");
  f.district = list(sp, "district");
  const site = get(sp, "site");
  if (site && slugRe.test(site)) f.site = site;
  f.island = list(sp, "island");
  const town = get(sp, "town")?.trim().slice(0, 80);
  if (town) f.town = town;
  f.grape = list(sp, "grape");
  f.type = list(sp, "type", WINE_TYPES);
  f.indigenous = bool(sp, "indigenous");
  f.cert = list(sp, "cert", CERTIFICATIONS);
  f.size = list(sp, "size", SIZE_CATEGORIES);
  f.family = bool(sp, "family");
  f.foundedFrom = num(sp, "foundedFrom", 1000, 2100);
  f.foundedTo = num(sp, "foundedTo", 1000, 2100);
  f.facility = list(sp, "facility", FACILITIES);
  f.lang = list(sp, "lang");
  f.competition = list(sp, "competition");
  f.medal = list(sp, "medal", MEDALS);
  f.awardYear = num(sp, "year", 1950, 2100);
  f.awarded = bool(sp, "awarded");
  f.exp = list(sp, "exp", EXPERIENCE_KINDS);
  f.priceMax = num(sp, "price", 0, 10000);
  f.group = num(sp, "group", 1, 500);
  f.durationMax = num(sp, "duration", 10, 2000);
  const near = get(sp, "near");
  if (near) {
    const [lat, lng] = near.split(",").map(Number);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) f.near = { lat, lng };
  }
  f.radius = num(sp, "radius", 1, 500);
  const bbox = get(sp, "bbox");
  if (bbox) {
    const b = bbox.split(",").map(Number);
    if (b.length === 4 && b.every(Number.isFinite) && b[0] < b[2] && b[1] < b[3]) f.bbox = b as [number, number, number, number];
  }
  const sort = get(sp, "sort");
  if (sort === "name" || sort === "distance" || sort === "founded" || sort === "featured" || sort === "relevance") f.sort = sort;
  f.featured = bool(sp, "featured");
  f.page = num(sp, "page", 1, 1000);
  for (const k of Object.keys(f) as (keyof WineryFilters)[]) if (f[k] === undefined) delete f[k];
  return f;
}

/** Serialise filters to URL params (stable order, defaults omitted). */
export function filtersToParams(f: WineryFilters): URLSearchParams {
  const p = new URLSearchParams();
  const set = (k: string, v: string | number | boolean | undefined | string[]) => {
    if (v === undefined || v === false || v === "" || (Array.isArray(v) && !v.length)) return;
    p.set(k, Array.isArray(v) ? v.join(",") : v === true ? "1" : String(v));
  };
  set("q", f.q);
  set("region", f.region); set("subregion", f.subregion); set("district", f.district); set("site", f.site);
  set("island", f.island); set("town", f.town);
  set("grape", f.grape); set("type", f.type); set("indigenous", f.indigenous); set("cert", f.cert);
  set("size", f.size); set("family", f.family); set("foundedFrom", f.foundedFrom); set("foundedTo", f.foundedTo);
  set("facility", f.facility); set("lang", f.lang);
  set("competition", f.competition); set("medal", f.medal); set("year", f.awardYear); set("awarded", f.awarded);
  set("exp", f.exp); set("price", f.priceMax); set("group", f.group); set("duration", f.durationMax);
  if (f.near) p.set("near", `${f.near.lat.toFixed(4)},${f.near.lng.toFixed(4)}`);
  set("radius", f.radius);
  if (f.bbox) p.set("bbox", f.bbox.map((n) => n.toFixed(4)).join(","));
  if (f.sort && f.sort !== "relevance") p.set("sort", f.sort);
  set("featured", f.featured);
  if (f.page && f.page > 1) p.set("page", String(f.page));
  return p;
}

/** Number of user-facing filters active (excluding paging, sort and map viewport). */
export function activeFilterCount(f: WineryFilters): number {
  const { page: _p, sort: _s, bbox: _b, ...rest } = f;
  void _p; void _s; void _b;
  return Object.values(rest).filter((v) => v !== undefined && !(Array.isArray(v) && !v.length)).length;
}

/** Filter combinations that are worth indexing in search engines (one facet at most). */
export function isIndexable(f: WineryFilters): boolean {
  const keys = Object.keys(f).filter((k) => k !== "page");
  if (keys.length === 0) return true;
  if (keys.length > 1) return false;
  const k = keys[0] as keyof WineryFilters;
  const v = f[k];
  return (k === "region" || k === "grape" || k === "type") && Array.isArray(v) && v.length === 1;
}
