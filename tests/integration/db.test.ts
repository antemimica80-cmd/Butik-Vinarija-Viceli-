import { afterAll, describe, expect, it } from "vitest";

const url = process.env.TEST_DATABASE_URL;
if (url) process.env.DATABASE_URL = url;
const d = url ? describe : describe.skip;

const { sql } = await import("@/lib/db");
const { searchWineries, wineryMarkers } = await import("@/lib/queries/wineries");
const { suggest, getGrape, searchWines } = await import("@/lib/queries/catalog");
const { parseFilters } = await import("@/lib/filters");
const { importWineriesCsvWith } = await import("@/lib/importer");

afterAll(async () => { if (url) await sql.end(); });

d("search & discovery (scenarios 2, 3, 11)", () => {
  it("finds Dingač producers when searching without diacritics", async () => {
    const r = await searchWineries(parseFilters(new URLSearchParams("q=dingac")));
    const names = r.items.map((i) => i.name);
    expect(names).toEqual(expect.arrayContaining(["Matuško", "Saints Hills", "Vina Skaramuča"]));
    const s = await suggest("dingac");
    expect(s.some((x) => x.kind === "site" && x.slug === "dingac")).toBe(true);
  });
  it("finds Plavac Mali wineries and wines for an English-speaking visitor", async () => {
    const r = await searchWineries(parseFilters(new URLSearchParams("q=Plavac Mali")));
    expect(r.total).toBeGreaterThan(5);
    const wines = await searchWines({ grape: ["plavac-mali"] });
    expect(wines.total).toBeGreaterThan(3);
    const g = await getGrape("plavac-mali");
    expect(g?.winery_count).toBeGreaterThan(5);
  });
  it("region filter returns only wineries of that region", async () => {
    const r = await searchWineries({ region: ["dalmacija"] }, { pageSize: 100 });
    expect(r.total).toBeGreaterThan(0);
    expect(r.items.every((i) => i.region_slug === "dalmacija")).toBe(true);
    const markers = await wineryMarkers({ region: ["sredisnja-bregovita-hrvatska"] });
    expect(markers.every((m) => m.region === "sredisnja-bregovita-hrvatska")).toBe(true);
  });
  it("tolerates typos via trigram similarity", async () => {
    const r = await searchWineries({ q: "malvazia" });
    expect(r.items.some((i) => i.region_slug === "hrvatska-istra-i-kvarner")).toBe(true);
  });
  it("orders by real distance when a location is given", async () => {
    const r = await searchWineries({ near: { lat: 42.65, lng: 18.09 }, radius: 100 });
    const d = r.items.map((i) => i.distance_km!);
    expect(d).toEqual([...d].sort((a, b) => a - b));
    expect(d.every((x) => x <= 100)).toBe(true);
  });
  it("never labels wineries with unsupported facilities", async () => {
    const r = await searchWineries({ facility: ["wheelchair_accessible"] });
    expect(r.total).toBe(0);
  });
});

d("data integrity", () => {
  it("rejects an award attached to another winery's wine", async () => {
    const [wine] = await sql<{ id: number }[]>`select id from wines where slug = 'bire-grk'`;
    const [other] = await sql<{ id: number }[]>`select id from wineries where slug = 'kozlovic'`;
    const [comp] = await sql<{ id: number }[]>`select id from competitions where slug = 'dwwa'`;
    await expect(sql`insert into wine_awards (competition_id, year, winery_id, wine_id, medal) values (${comp.id}, 2024, ${other.id}, ${wine.id}, 'gold')`).rejects.toThrow();
  });
  it("does not show unverified awards publicly", async () => {
    const [wine] = await sql<{ id: number; winery_id: number }[]>`select id, winery_id from wines where slug = 'bire-grk'`;
    const [comp] = await sql<{ id: number }[]>`select id from competitions where slug = 'dwwa'`;
    await sql`insert into wine_awards (competition_id, year, winery_id, wine_id, medal, verification) values (${comp.id}, 2099, ${wine.winery_id}, ${wine.id}, 'gold', 'owner_submitted')`;
    const r = await searchWineries({ awarded: true });
    expect(r.items.find((i) => i.slug === "bire")).toBeUndefined();
    await sql`delete from wine_awards where year = 2099`;
  });
  it("importer validates rows and never silently merges duplicates", async () => {
    const csv = [
      "name,region,town,source_name,lat,lng",
      "Matuško,dalmacija,Potomje,Test source,42.93,17.33",          // same name as existing → skip
      "Nova Test Vinarija,dalmacija,Split,Test source,43.5,16.44",  // valid → create
      "Bad Row,atlantis,Nowhere,Test source,,",                      // unknown region → error
    ].join("\n");
    const r = await importWineriesCsvWith(sql, csv, { dryRun: true, userId: null });
    expect(r.rows.map((x) => x.action)).toEqual(["skip", "create", "error"]);
    const [{ count }] = await sql<{ count: number }[]>`select count(*)::int from wineries where name = 'Nova Test Vinarija'`;
    expect(count).toBe(0); // dry run wrote nothing
  });
});
