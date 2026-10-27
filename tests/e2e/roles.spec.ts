import { expect, test } from "@playwright/test";
import { login, db } from "./helpers";

test.describe("Roles & permissions", () => {
  test("7. winery owner sees only their authorised winery", async ({ page }) => {
    await login(page, "owner@atlas.test", "atlas-owner-dev");
    await expect(page).toHaveURL(/\/en\/owner$/);
    await expect(page.getByText("Vinarija Toreta")).toBeVisible();
    await expect(page.getByText("Korta Katarina")).toHaveCount(0);
    await page.goto("/en/owner/toreta/inquiries");
    await expect(page.getByRole("heading", { name: "Vinarija Toreta" })).toBeVisible();
    // Another winery's portal redirects back to the owner home.
    await page.goto("/en/owner/korta-katarina/inquiries");
    await expect(page).toHaveURL(/\/en\/owner$/);
    // Admin is off limits.
    await page.goto("/en/admin");
    await expect(page).not.toHaveURL(/\/admin/);
  });

  test("7b. owner profile edits go to editor review, not straight to the public page", async ({ page }) => {
    await login(page, "owner@atlas.test", "atlas-owner-dev");
    await page.goto("/en/owner/toreta/profile");
    await page.locator('textarea[name="en.story"]').fill("E2E pending story text.");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("will be published after review")).toBeVisible();
    await page.goto("/en/wineries/toreta");
    await expect(page.locator("body")).not.toContainText("E2E pending story text.");
  });

  test("8. administrator updates a winery and the public page reflects it", async ({ page }) => {
    await login(page, "admin@atlas.test", "atlas-admin-dev");
    await expect(page).toHaveURL(/\/en\/admin$/);
    const sql = db();
    const [{ id }] = await sql`select id from wineries where slug = 'gracin'`;
    await sql.end();
    await page.goto(`/en/admin/wineries/${id}`);
    await page.locator('textarea[name="en.description"]').fill("Leo Gracin's small Primošten cellar — E2E admin edit.");
    await page.locator('input[name="phone"]').fill("+385 1 234 567");
    await page.getByRole("button", { name: "Save winery" }).click();
    await expect(page.getByText("Saved and published.")).toBeVisible();
    await page.goto("/en/wineries/gracin");
    await expect(page.locator("#overview")).toContainText("E2E admin edit.");
    await expect(page.getByRole("link", { name: "+385 1 234 567" })).toBeVisible();
  });

  test("5b. verified awards appear on the correct wine only", async ({ page }) => {
    await login(page, "admin@atlas.test", "atlas-admin-dev");
    await page.goto("/en/admin/awards");
    await page.locator('select[name="wineId"]').selectOption({ label: "Bire — Grk" });
    await page.locator('select[name="competition"]').selectOption("dwwa");
    await page.locator('input[name="year"]').fill("2025");
    await page.locator('input[name="vintage"]').fill("2023");
    await page.locator('select[name="medal"]').selectOption("silver");
    await page.locator('input[name="sourceUrl"]').fill("https://awards.decanter.com/DWWA/2025/search/wines?e2e=1");
    await page.getByRole("button", { name: "Save award" }).click();
    await expect(page.getByText("Award saved.")).toBeVisible();
    await page.goto("/en/wineries/bire");
    await expect(page.locator("#awards")).toContainText("Silver");
    await expect(page.locator("#awards")).toContainText("Vintage 2023");
    await page.goto("/en/wineries/toreta");
    await expect(page.locator("#awards")).toContainText("No verified awards");
    // Clean up so the test is repeatable.
    const sql = db();
    await sql`delete from wine_awards where source_url like '%e2e=1'`;
    await sql.end();
  });

  test("15. unauthorised users cannot read or change protected data", async ({ page, request }) => {
    // Anonymous: portal pages redirect to sign-in, admin export is forbidden.
    await page.goto("/en/owner/toreta/inquiries");
    await expect(page).toHaveURL(/\/en\/login\?next=/);
    expect((await request.get("/api/admin/export/wineries")).status()).toBe(403);
    // Public APIs never expose inquiry data.
    const api = await (await request.get("/api/wineries?q=toreta")).text();
    expect(api).not.toContain("e2e.visitor@example.com");
    // A visitor account cannot reach admin or another winery's tools.
    await login(page, "visitor@atlas.test", "atlas-visitor-dev");
    await page.goto("/en/admin/users");
    await expect(page).not.toHaveURL(/\/admin/);
    await page.goto("/en/owner/toreta/profile");
    await expect(page).toHaveURL(/\/en\/owner$/);
  });
});
