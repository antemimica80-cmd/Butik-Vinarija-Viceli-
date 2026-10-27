import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
const { issueFormToken, checkFormToken } = await import("@/lib/security");
const { hashPassword, verifyPassword } = await import("@/lib/password");
const { pgArrayLiteral } = await import("@/lib/db").catch(() => ({ pgArrayLiteral: null as never }));

describe("form tokens (anti-spam timing)", () => {
  it("accepts a token after a human-plausible delay", () => {
    const t = issueFormToken(Date.now() - 10_000);
    expect(checkFormToken(t)).toBe("ok");
  });
  it("rejects instant submissions, tampering and expiry", () => {
    expect(checkFormToken(issueFormToken())).toBe("too_fast");
    expect(checkFormToken(issueFormToken(Date.now() - 10_000).replace(/.$/, "x"))).toBe("invalid");
    expect(checkFormToken(issueFormToken(Date.now() - 1000 * 60 * 60 * 24))).toBe("expired");
    expect(checkFormToken(undefined)).toBe("missing");
  });
});

describe("passwords", () => {
  it("hashes with scrypt and verifies", async () => {
    const h = await hashPassword("correct horse battery staple");
    expect(h.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse battery staple", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  });
});

describe("postgres array literal", () => {
  it("quotes and escapes elements", () => {
    if (!pgArrayLiteral) return;
    expect(pgArrayLiteral(["a", 'b"c', "d\\e"])).toBe('{"a","b\\"c","d\\\\e"}');
  });
});
