import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";

function secret() {
  const s = process.env.APP_SECRET;
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV === "production") throw new Error("APP_SECRET must be set (16+ chars) in production");
    return "insecure-development-secret";
  }
  return s;
}

export function hmac(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Client IP from proxy headers, hashed (raw IPs are never stored). */
export async function clientIpHash(): Promise<string> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim();
  return hmac(`ip:${ip}`).slice(0, 32);
}

/**
 * Signed timestamp embedded in public forms. Rejects submissions that arrive faster than a
 * human could fill in the form, or from a very stale page.
 */
export function issueFormToken(now = Date.now()) {
  const ts = String(now);
  return `${ts}.${hmac(`form:${ts}`).slice(0, 24)}`;
}

export type FormTokenResult = "ok" | "missing" | "invalid" | "too_fast" | "expired";

export function checkFormToken(token: string | null | undefined, minMs = 2500, maxMs = 1000 * 60 * 60 * 6, now = Date.now()): FormTokenResult {
  if (!token) return "missing";
  const [ts, sig] = token.split(".");
  if (!ts || !sig || !safeEqual(sig, hmac(`form:${ts}`).slice(0, 24))) return "invalid";
  const age = now - Number(ts);
  if (age < minMs) return "too_fast";
  if (age > maxMs) return "expired";
  return "ok";
}
