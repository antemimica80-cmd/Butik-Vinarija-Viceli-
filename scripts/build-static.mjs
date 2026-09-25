/**
 * Static preview build for GitHub Pages → ./out
 *
 *   BASE_PATH=/Butik-Vinarija-Viceli- SITE_URL=https://<user>.github.io/Butik-Vinarija-Viceli- node scripts/build-static.mjs
 *
 * A static export cannot contain server code, so the API routes, the admin, the
 * payment/confirmation pages and the proxy (language redirects) are moved aside for
 * the build and restored afterwards. Localised Croatian URLs (/hr/degustacije …)
 * are then created as copies, because without the proxy there is nothing to rewrite them.
 */
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, renameSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const basePath = process.env.BASE_PATH ?? '/Butik-Vinarija-Viceli-';
const siteUrl = process.env.SITE_URL ?? `https://antemimica80-cmd.github.io${basePath}`;

const serverOnly = [
  'src/proxy.ts',
  'src/app/api',
  'src/app/admin',
  'src/app/[locale]/experience/checkout',
  'src/app/[locale]/experience/booked',
  'src/app/[locale]/shop/checkout',
  'src/app/[locale]/shop/ordered',
];
const stash = '.static-stash';

function moveAside() {
  rmSync(stash, { recursive: true, force: true });
  for (const p of serverOnly) {
    if (!existsSync(p)) continue;
    const to = join(stash, p);
    mkdirSync(dirname(to), { recursive: true });
    renameSync(p, to);
  }
}

function restore() {
  for (const p of serverOnly) {
    const from = join(stash, p);
    if (existsSync(from)) {
      mkdirSync(dirname(p), { recursive: true });
      renameSync(from, p);
    }
  }
  rmSync(stash, { recursive: true, force: true });
}

// Croatian pathnames from src/i18n/routing.ts (internal → hr). Kept in sync by hand;
// the build fails loudly below if a source folder is missing.
const hrPaths = {
  experience: 'degustacije',
  family: 'obitelj',
  wines: 'vina',
  shop: 'trgovina',
  visit: 'posjet',
  legal: 'pravno',
};

moveAside();
try {
  rmSync('out', { recursive: true, force: true });
  rmSync('.next', { recursive: true, force: true });
  execSync('npx next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      STATIC_EXPORT: '1',
      NEXT_PUBLIC_STATIC_EXPORT: '1',
      NEXT_PUBLIC_BASE_PATH: basePath,
      NEXT_PUBLIC_SITE_URL: siteUrl,
    },
  });
} finally {
  restore();
}

// Localised Croatian folders: /hr/experience → /hr/degustacije, etc. (keep both).
for (const [from, to] of Object.entries(hrPaths)) {
  const src = join('out', 'hr', from);
  if (!existsSync(src)) throw new Error(`missing ${src}`);
  cpSync(src, join('out', 'hr', to), { recursive: true });
}
// Nested Croatian segments: /hr/trgovina/cart → /hr/trgovina/kosarica
const nested = [['trgovina', 'cart', 'kosarica']];
for (const [parent, from, to] of nested) {
  const src = join('out', 'hr', parent, from);
  if (existsSync(src)) cpSync(src, join('out', 'hr', parent, to), { recursive: true });
}

// Root: send visitors to their language.
writeFileSync(
  'out/index.html',
  `<!doctype html><html><head><meta charset="utf-8"><title>Vicelić</title>
<meta name="robots" content="noindex">
<script>location.replace('${basePath}/' + ((navigator.language || '').toLowerCase().startsWith('hr') ? 'hr' : 'en') + '/');</script>
<meta http-equiv="refresh" content="0; url=${basePath}/en/"></head><body></body></html>`,
);
// GitHub Pages: serve folders starting with "_" (/_next).
writeFileSync('out/.nojekyll', '');

const count = (dir) => readdirSync(dir, { withFileTypes: true }).reduce((n, d) => n + (d.isDirectory() ? count(join(dir, d.name)) : 1), 0);
console.log(`\n✓ Static preview in ./out (${count('out')} files), base path ${basePath}`);
