export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const MAP_STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/positron";
/** [west, south, east, north] */
export const CROATIA_BOUNDS: [number, number, number, number] = [13.35, 42.35, 19.5, 46.6];
