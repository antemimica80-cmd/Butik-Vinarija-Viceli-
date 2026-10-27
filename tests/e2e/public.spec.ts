import { expect, test } from "@playwright/test";
import { db, waitForMap, expectNoA11yBasics } from "./helpers";

test.describe("Discovery", () => {
  test("1. Croatian user opens the map, selects Dalmacija and sees real Dalmatian wineries", async ({ page }) => {
    await page.goto("/hr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Svijet vina. Jedna iznimna zemlja.");
    await page.getByRole("link", { name: "Istražite kartu" }).click();
    await expect(page).toHaveURL(/\/hr\/karta/);
    await page.getByRole("button", { name: /Približi: Dalmacija/ }).click();
    await expect(page).toHaveURL(/region=dalmacija/);
    const list = page.locator("aside [data-winery-id]");
    await expect(page.getByText(/16 vinarija/).first()).toBeVisible();
    await expect(list.filter({ hasText: "Korta Katarina" })).toHaveCount(1);
    await expect(list.filter({ hasText: "Kozlović" })).toHaveCount(0);
  });

  test("2. English tourist searches Plavac Mali and finds wineries and wines", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("combobox").first().fill("Plavac Mali");
    await expect(page.getByRole("option", { name: /Plavac Mali.*Grape/ })).toBeVisible();
    await page.getByRole("combobox").first().press("Enter");
    await expect(page).toHaveURL(/\/en\/wineries\?q=Plavac/);
    await expect(page.getByRole("heading", { name: "Korta Katarina" })).toBeVisible();
    await page.goto("/en/grapes/plavac-mali");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Plavac Mali");
    await expect(page.getByRole("link", { name: /Dingač/ }).first()).toBeVisible();
  });

  test("3. 'dingac' without diacritics finds Dingač", async ({ page }) => {
    await page.goto("/en/wineries?q=dingac");
    for (const name of ["Matuško", "Saints Hills", "Vina Skaramuča"]) await expect(page.getByRole("heading", { name })).toBeVisible();
    await page.goto("/en");
    await page.getByRole("combobox").first().fill("dingac");
    await page.getByRole("option", { name: /Dingač.*Vineyard site/ }).click();
    await expect(page).toHaveURL(/\/en\/vineyard-sites\/dingac/);
  });

  test("4. clicking a map marker opens a preview and leads to the profile", async ({ page }) => {
    await page.goto("/en/map?subregion=srednja-i-juzna-dalmacija");
    await waitForMap(page);
    const box = await page.evaluate(async () => {
      const m = (window as unknown as { __atlasMap: { jumpTo(o: object): void; project(c: [number, number]): { x: number; y: number }; once(e: string, f: () => void): void } }).__atlasMap;
      m.jumpTo({ center: [16.655, 43.2617], zoom: 13 }); // Bol, Brač (Stina)
      await new Promise<void>((r) => m.once("idle", () => r()));
      return m.project([16.655, 43.2617]);
    });
    const canvas = page.locator("canvas.maplibregl-canvas").first();
    const cb = await canvas.boundingBox();
    await page.mouse.click(cb!.x + box.x, cb!.y + box.y);
    const popup = page.locator(".maplibregl-popup");
    await expect(popup).toContainText("Stina");
    await popup.getByRole("link", { name: "Open profile" }).click();
    await expect(page).toHaveURL(/\/en\/wineries\/stina/);
  });

  test("5/12. profile shows grapes, wines, locations; missing data is shown honestly", async ({ page }) => {
    await page.goto("/en/wineries/skaramuca");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vina Skaramuča");
    await expect(page.locator("#wines")).toContainText("Dingač Elegance");
    await expect(page.locator("#grapes")).toContainText("Plavac Mali");
    await expect(page.locator("#location")).toContainText("Viganj");
    await expect(page.locator("#awards")).toContainText("No verified awards");
    await expect(page.locator("#sources")).toContainText("Total Croatia News");
    await page.goto("/en/wineries/korak");
    await expect(page.locator("#wines")).toContainText("No wines have been added");
    await expect(page.locator("#vineyards")).toContainText("We never estimate these figures");
    await expect(page.locator("body")).not.toContainText(/undefined|NaN|null/);
  });

  test("9. switching language keeps the equivalent page", async ({ page }) => {
    await page.goto("/hr/vinarije/matusko");
    await page.getByRole("button", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\/wineries\/matusko$/);
    await page.goto("/en/regions/dalmacija");
    await page.getByRole("button", { name: "Hrvatski" }).click();
    await expect(page).toHaveURL(/\/hr\/regije\/dalmacija$/);
  });

  test("11. region filter in the directory shows only that region", async ({ page }) => {
    await page.goto("/en/wineries?region=slavonija-i-hrvatsko-podunavlje");
    const cards = page.locator("main article");
    await expect(cards).toHaveCount(9);
    for (const text of await cards.allInnerTexts()) expect(text).toMatch(/slavonia/i);
  });

  test("14. key pages have metadata, hreflang and accessible structure", async ({ page }) => {
    for (const path of ["/en", "/hr/vinarije", "/en/wineries/kozlovic", "/hr/regije/dalmacija", "/en/grapes/posip"]) {
      await page.goto(path);
      await expectNoA11yBasics(page);
      expect(await page.title()).not.toBe("");
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="hr"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
    }
    await page.goto("/en/wineries/kozlovic");
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.some((s) => s.includes('"@type":"Winery"'))).toBe(true);
    expect(ld.some((s) => s.includes("aggregateRating") || s.includes('"offers"'))).toBe(false);
    const sitemap = await page.request.get("/sitemap.xml");
    expect(await sitemap.text()).toContain("/hr/vinarije/kozlovic");
  });
});

test.describe("Tasting inquiry", () => {
  test("6. visitor sends a tasting request without registering and it is stored", async ({ page }) => {
    await page.goto("/en/wineries/toreta/inquiry");
    await expect(page.getByText("No account needed.")).toBeVisible();
    const date = new Date(Date.now() + 1000 * 3600 * 24 * 20).toISOString().slice(0, 10);
    await page.getByLabel("Preferred date").fill(date);
    await page.getByLabel("Adults (18+)").fill("3");
    await page.getByLabel("Full name").fill("E2E Visitor");
    await page.getByLabel("Email").fill("e2e.visitor@example.com");
    await page.getByLabel("Special requests").fill("Vegetarian please.");
    await page.getByLabel(/I agree that my request/).check();
    await page.waitForTimeout(3000); // anti-spam timing token
    await page.getByRole("button", { name: "Send request" }).click();
    await expect(page.getByRole("heading", { name: "Request received" })).toBeVisible();
    const ref = (await page.getByText(/reference CWA-/).textContent())!.match(/CWA-[A-Z0-9]+/)![0];
    const sql = db();
    const [row] = await sql`select i.full_name, i.adults, w.slug, i.status from tasting_inquiries i join wineries w on w.id = i.winery_id where public_ref = ${ref}`;
    const [mail] = await sql`select status from email_outbox where kind = 'inquiry_ack' order by id desc limit 1`;
    await sql.end();
    expect(row).toMatchObject({ full_name: "E2E Visitor", adults: 3, slug: "toreta", status: "new" });
    expect(mail.status).toBe("no_provider"); // no provider configured in tests → never claimed as sent
    await expect(page.getByText(/queued/)).toBeVisible();
  });

  test("6b. invalid submissions are rejected with helpful errors", async ({ page }) => {
    await page.goto("/en/wineries/toreta/inquiry");
    await page.getByRole("button", { name: "Send request" }).click();
    await expect(page.getByText("Please enter your name.")).toBeVisible();
    await expect(page.getByText("Please accept the privacy policy")).toBeVisible();
  });
});

test.describe("Routes", () => {
  test("10. build and share a wine route from real winery locations", async ({ page, browser }) => {
    for (const slug of ["korta-katarina", "matusko", "grgic-vina"]) {
      await page.goto(`/en/wineries/${slug}`);
      await page.getByRole("button", { name: "Add to route" }).first().click();
      await expect(page.getByRole("button", { name: "In your route" }).first()).toBeVisible();
    }
    await page.goto("/en/wine-routes/planner");
    const stops = page.getByRole("list", { name: "Route planner" }).getByRole("listitem");
    await expect(stops).toHaveCount(3);
    await page.getByRole("button", { name: "Move up: Matuško" }).click();
    await expect(stops.first()).toContainText("Matuško");
    await expect(page.getByText(/no routing service is configured/)).toBeVisible();
    const google = await page.getByRole("link", { name: "Open in Google Maps" }).getAttribute("href");
    expect(google).toContain("waypoints=");
    const shared = `/en/wine-routes/planner?stops=matusko,korta-katarina,grgic-vina`;
    const other = await browser.newPage();
    await other.goto(shared);
    const sharedStops = other.getByRole("list", { name: "Route planner" }).getByRole("listitem");
    await expect(sharedStops).toHaveCount(3);
    await expect(sharedStops.first()).toContainText("Matuško");
    await other.close();
  });
});
