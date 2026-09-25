/**
 * Screenshots of key views at 390 px (phone) and 1440 px (desktop).
 * Usage: npm run build && npm start   (in another shell)
 *        npm run screenshots -- [baseUrl]
 */
import { chromium, type Page } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:3000';
const out = 'screenshots';
mkdirSync(out, { recursive: true });

const widths = [
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 900 },
];

type View = { name: string; path: string; age?: boolean; consent?: boolean; fullPage?: boolean; action?: (p: Page) => Promise<void> };

const views: View[] = [
  { name: 'age-gate', path: '/en', age: false },
  { name: 'consent', path: '/en', age: true, consent: false },
  { name: 'home', path: '/en', fullPage: true },
  ...[0.2, 0.55, 0.97].map((p) => ({
    name: `tunnel-${Math.round(p * 100)}`,
    path: '/en',
    action: async (page: Page) => {
      await page.evaluate((p) => {
        const el = document.querySelector<HTMLElement>('.tunnel')!;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top + (el.offsetHeight - window.innerHeight) * p);
      }, p);
    },
  })),
  {
    name: 'three-suns',
    path: '/en',
    action: async (page: Page) => {
      await page.locator('#st-stone').scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -80));
      await page.waitForTimeout(5500);
    },
  },
  { name: 'home-hr', path: '/hr' },
  { name: 'design', path: '/en/design', fullPage: true },
  { name: 'dingac', path: '/en/dingac', fullPage: true },
  { name: 'experience', path: '/en/experience', fullPage: true },
  { name: 'visit-hr', path: '/hr/posjet', fullPage: true },
  { name: 'legal-terms', path: '/en/legal/terms', fullPage: true },
  {
    name: 'menu',
    path: '/en/wines',
    action: async (p) => {
      const toggle = p.getByRole('button', { name: 'Menu' });
      if (await toggle.isVisible()) await toggle.click();
    },
  },
];

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const w of widths) {
    for (const v of views) {
      const ctx = await browser.newContext({ viewport: { width: w.width, height: w.height }, deviceScaleFactor: 1 });
      const url = new URL(base);
      const cookies = [];
      if (v.age !== false) cookies.push({ name: 'vicelic_age', value: '1', domain: url.hostname, path: '/' });
      if (v.consent !== false && v.age !== false) cookies.push({ name: 'vicelic_consent', value: 'necessary', domain: url.hostname, path: '/' });
      if (cookies.length) await ctx.addCookies(cookies);
      const page = await ctx.newPage();
      await page.goto(base + v.path, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      if (v.fullPage) {
        // Reveal everything so full-page captures are not blank below the fold
        await page.evaluate(() => document.querySelectorAll('.reveal, .three-suns').forEach((el) => el.setAttribute('data-visible', 'true')));
      }
      if (v.action) await v.action(page);
      await page.waitForTimeout(1800);
      const file = `${out}/${v.name}-${w.name}.png`;
      await page.screenshot({ path: file, fullPage: v.fullPage });
      console.log('✓', file);
      await ctx.close();
    }
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
