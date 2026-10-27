import { expect, test } from "@playwright/test";

test.describe("13. Mobile", () => {
  test("map with bottom sheet, filters and search are usable on a phone", async ({ page }) => {
    await page.goto("/en/map");
    await expect(page.locator("canvas.maplibregl-canvas").first()).toBeVisible({ timeout: 30_000 });
    const sheet = page.getByRole("button", { name: "Drag to resize the results panel" });
    await expect(sheet).toBeVisible();
    await sheet.click(); // expand
    await page.getByRole("button", { name: /^Filters/ }).last().click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: /Croatian Istria & Kvarner/ }).click();
    await dialog.getByRole("button", { name: /Show 15 wineries/ }).click();
    await expect(page).toHaveURL(/region=hrvatska-istra-i-kvarner/);
    await page.locator("#explorer-q").last().fill("teran");
    await page.locator("#explorer-q").last().press("Enter");
    await expect(page.locator("[data-winery-id]").filter({ hasText: "Coronica" }).last()).toBeVisible();
  });

  test("winery profile has a sticky contact bar and no horizontal scroll", async ({ page }) => {
    await page.goto("/hr/vinarije/kozlovic");
    await expect(page.getByRole("link", { name: "Zatražite degustaciju" }).last()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.getByRole("button", { name: "Izbornik" }).click();
    await expect(page.locator("#mobile-nav")).toBeVisible();
  });
});
