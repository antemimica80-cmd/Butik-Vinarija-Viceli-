import { expect, type Page } from "@playwright/test";
import postgres from "postgres";
import "../../scripts/env";

export const db = () => postgres(process.env.TEST_DATABASE_URL ?? "postgres://atlas:atlas@localhost:5432/atlas_test", { max: 1, onnotice: () => {} });

export async function login(page: Page, email: string, password: string, locale: "hr" | "en" = "en") {
  await page.goto(`/${locale}/${locale === "hr" ? "prijava" : "login"}`);
  await page.getByLabel(locale === "hr" ? "E-pošta" : "Email").fill(email);
  await page.getByLabel(locale === "hr" ? "Lozinka" : "Password").fill(password);
  await page.getByRole("button", { name: locale === "hr" ? "Prijavi se" : "Sign in" }).click();
  await page.waitForURL((u) => !u.pathname.includes("login") && !u.pathname.includes("prijava"));
}

/** Waits for the MapLibre instance (exposed when NEXT_PUBLIC_E2E=1) to finish loading markers. */
export async function waitForMap(page: Page) {
  await page.waitForFunction(() => {
    const m = (window as unknown as { __atlasMap?: { loaded(): boolean; querySourceFeatures(s: string): unknown[] } }).__atlasMap;
    return !!m && m.loaded() && m.querySourceFeatures("wineries").length > 0;
  }, undefined, { timeout: 30_000 });
}

export async function expectNoA11yBasics(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("lang", /^(hr|en)$/);
  await expect(page.locator("main#main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
}
