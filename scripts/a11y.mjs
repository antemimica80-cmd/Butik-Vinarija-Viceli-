// Accessibility audit (axe-core, WCAG 2.1 AA) of the main pages. Needs `npm start` running.
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
const base = process.argv[2] ?? 'http://localhost:3000';
const pages = ['/en', '/hr', '/en/experience', '/en/dingac', '/en/family', '/en/wines', '/en/wines/dingac', '/en/shop', '/en/shop/dingac', '/en/shop/cart', '/en/visit', '/en/legal/terms'];
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const c = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const host = new URL(base).hostname;
await c.addCookies([{ name: 'vicelic_age', value: '1', domain: host, path: '/' }, { name: 'vicelic_consent', value: 'necessary', domain: host, path: '/' }]);
let total = 0;
for (const path of pages) {
  const p = await c.newPage();
  await p.goto(base + path, { waitUntil: 'networkidle' });
  const r = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  total += r.violations.length;
  console.log(r.violations.length ? '✗' : '✓', path, r.violations.map((v) => `${v.id}(${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`).join('; '));
  await p.close();
}
await b.close();
process.exit(total ? 1 : 0);
