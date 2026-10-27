import { describe, expect, it } from "vitest";
import { parseFilters, filtersToParams, activeFilterCount, isIndexable } from "@/lib/filters";

describe("winery filters", () => {
  it("parses a shareable URL", () => {
    const f = parseFilters(new URLSearchParams("q=plavac&region=dalmacija,hrvatska-istra-i-kvarner&type=red&facility=tasting&near=42.65,18.09&radius=50&sort=distance&page=2"));
    expect(f).toMatchObject({ q: "plavac", region: ["dalmacija", "hrvatska-istra-i-kvarner"], type: ["red"], facility: ["tasting"], near: { lat: 42.65, lng: 18.09 }, radius: 50, sort: "distance", page: 2 });
  });
  it("drops invalid or unsafe values", () => {
    const f = parseFilters(new URLSearchParams("region=<script>&type=blue&facility=jacuzzi&page=-1&radius=99999&bbox=1,2,3&near=999,1"));
    expect(f).toEqual({});
  });
  it("round-trips through URL params", () => {
    const f = parseFilters(new URLSearchParams("grape=posip&indigenous=1&medal=gold&year=2024"));
    expect(parseFilters(filtersToParams(f))).toEqual(f);
  });
  it("counts active filters, ignoring paging, sort and viewport", () => {
    expect(activeFilterCount({ page: 3, sort: "name", bbox: [13, 42, 19, 46] })).toBe(0);
    expect(activeFilterCount({ region: ["dalmacija"], family: true })).toBe(2);
  });
  it("only allows simple facets to be indexed", () => {
    expect(isIndexable({})).toBe(true);
    expect(isIndexable({ region: ["dalmacija"] })).toBe(true);
    expect(isIndexable({ region: ["dalmacija"], type: ["red"] })).toBe(false);
    expect(isIndexable({ q: "x" })).toBe(false);
  });
});
