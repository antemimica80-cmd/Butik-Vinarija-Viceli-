import { describe, expect, it } from "vitest";
import { norm, slugify, tokenize } from "@/lib/norm";

describe("norm (diacritic-insensitive search)", () => {
  it("strips Croatian diacritics", () => {
    expect(norm("Pošip")).toBe("posip");
    expect(norm("Dingač")).toBe("dingac");
    expect(norm("Žlahtina")).toBe("zlahtina");
    expect(norm("Ćelije")).toBe("celije");
    expect(norm("Graševina")).toBe("grasevina");
  });
  it("treats đ and the 'dj' spelling the same", () => {
    expect(norm("Đakovo")).toBe(norm("Djakovo"));
    expect(norm("Đakovo")).toBe("dakovo");
  });
  it("tokenizes queries and drops one-letter tokens and punctuation", () => {
    expect(tokenize("  Plavac   Mali! a ")).toEqual(["plavac", "mali"]);
    expect(tokenize("dingač")).toEqual(["dingac"]);
    expect(tokenize(undefined)).toEqual([]);
  });
  it("makes URL-safe slugs", () => {
    expect(slugify("Vinarija Pošip & Co.")).toBe("vinarija-posip-and-co");
    expect(slugify("Badel 1862 – Vinarija Korlat")).toBe("badel-1862-vinarija-korlat");
  });
});
