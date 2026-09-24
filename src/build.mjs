// Static site build → dist/
//   node src/build.mjs            production (clean URLs, absolute paths)
//   node src/build.mjs --preview  relative links + explicit index.html (open from disk / artifact preview)
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname, relative, posix } from 'node:path';
import sharp from 'sharp';
import { site, wines } from './content.mjs';
import { ui, href, routes } from './i18n.mjs';
import { esc, ld, icons, photoUrl, bottle, imgs } from './lib.mjs';
import { pages, notFound } from './pages.mjs';

const root = new URL('..', import.meta.url).pathname;
const PREVIEW = process.argv.includes('--preview');
const out = join(root, PREVIEW ? 'preview' : 'dist');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const V = Date.now().toString(36); // cache-busting

// ─── Static assets ───────────────────────────────────────────────────────────
mkdirSync(join(out, 'assets'), { recursive: true });
mkdirSync(join(out, 'fonts'), { recursive: true });
// light CSS minification (comments + whitespace)
writeFileSync(join(out, 'assets/site.css'), readFileSync(join(root, 'src/assets/site.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}'));
copyFileSync(join(root, 'src/assets/site.js'), join(out, 'assets/site.js'));
// Fonts: Noto Serif Display + Jost (OFL), pre-subset in src/fonts (latin-ext = Latin Extended-A → č ć đ š ž)
for (const f of readdirSync(join(root, 'src/fonts'))) copyFileSync(join(root, 'src/fonts', f), join(out, 'fonts', f));
if (existsSync(join(root, 'public/img'))) {
  mkdirSync(join(out, 'img'), { recursive: true });
  for (const f of readdirSync(join(root, 'public/img'))) copyFileSync(join(root, 'public/img', f), join(out, 'img', f));
}
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#111"/><text x="32" y="45" text-anchor="middle" font-family="Georgia,serif" font-size="38" fill="#F1ECE3">V</text></svg>`;
writeFileSync(join(out, 'favicon.svg'), favicon);
await sharp(Buffer.from(favicon)).resize(180).png().toFile(join(out, 'apple-touch-icon.png'));
// Default social card (replaced by hero photography once available)
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#111"/><rect y="440" width="1200" height="190" fill="#541D26" opacity=".35"/><text x="600" y="300" text-anchor="middle" font-family="Georgia,serif" font-size="110" letter-spacing="30" fill="#F1ECE3">VICELIĆ</text><text x="600" y="370" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="22" letter-spacing="9" fill="#cfc8bd">DINGAČ · PELJEŠAC · CROATIA</text></svg>`;
await sharp(Buffer.from(og)).jpeg({ quality: 86 }).toFile(join(out, 'og-default.jpg'));

// ─── Layout ──────────────────────────────────────────────────────────────────
const other = L => (L === 'hr' ? 'en' : 'hr');
const abs = p => site.url + p;

function navHtml(L, key) {
  const n = ui[L].nav;
  const cur = k => (key === k || (k === 'wines' && /^wine-/.test(key)) || (k === 'shop' && /^product-/.test(key))) ? ' aria-current="page"' : '';
  const left = [['story', n.story], ['dingac', n.dingac], ['wines', n.wines]];
  const right = [['experience', n.experience], ['shop', n.shop], ['contact', n.contact]];
  const langs = `<nav class="lang" aria-label="${L === 'hr' ? 'Jezik' : 'Language'}"><a href="${href('hr', key === '404' ? 'home' : key)}" hreflang="hr" lang="hr" ${L === 'hr' ? 'aria-current="true"' : ''}>HR</a><span aria-hidden="true">|</span><a href="${href('en', key === '404' ? 'home' : key)}" hreflang="en" lang="en" ${L === 'en' ? 'aria-current="true"' : ''}>EN</a></nav>`;
  return `<a class="skip" href="#main">${ui[L].skip}</a>
<header class="nav" role="banner"><div class="wrap nav-in">
<div class="nav-l"><button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="${ui[L].menu}"><i></i></button>${left.map(([k, t]) => `<a class="nl" href="${href(L, k)}"${cur(k)}>${t}</a>`).join('')}</div>
<a class="brand" href="${href(L, 'home')}"><span class="w">VICELIĆ</span><span class="s">Boutique Winery · Dingač</span></a>
<div class="nav-r">${right.map(([k, t]) => `<a class="nl" href="${href(L, k)}"${cur(k)}>${t}</a>`).join('')}${langs}<a class="cart-btn" href="${href(L, 'shop')}" aria-label="${ui[L].cart}">${icons.cart}<span class="lbl">${ui[L].cart}</span><span class="cart-count" aria-live="polite">0</span></a></div>
</div></header>
<div class="menu" id="menu" aria-label="${ui[L].menu}"><nav><ol>${[...left, ...right].map(([k, t]) => `<li><a href="${href(L, k)}"${cur(k)}>${t}</a></li>`).join('')}</ol></nav>
<div class="menu-foot">${langs}<div class="menu-contact"><a href="tel:${site.phoneHref}">${site.phone}</a><a href="mailto:${site.email}">${site.email}</a></div><a class="btn btn-light" href="${href(L, 'experience')}#rezervacija">${ui[L].reserve}</a></div></div>`;
}

function footerHtml(L) {
  const f = ui[L].footer, n = ui[L].nav;
  return `<footer class="foot"><div class="wrap">
<div class="grid">
<div class="fb"><p class="big">${f.tagline}</p><div class="actions mt-3"><a class="btn btn-light" href="${href(L, 'experience')}#rezervacija">${ui[L].reserve}</a></div></div>
<div class="fc"><h2>${f.wines}</h2><ul><li><a href="${href(L, 'dingac')}">Dingač</a></li><li><a href="${href(L, 'wine-plavac-mali')}">Plavac Mali</a></li><li><a href="${href(L, 'wine-opolo-rose')}">Opolo Rosé</a></li><li><a href="${href(L, 'shop')}">${n.shop}</a></li></ul></div>
<div class="fc"><h2>${f.winery}</h2><ul><li><a href="${href(L, 'story')}">${L === 'hr' ? 'Naša priča' : 'Our story'}</a></li><li><a href="${href(L, 'experience')}">${n.experience}</a></li><li><a href="${href(L, 'contact')}">${n.contact}</a></li>${site.facebook ? `<li><a href="${site.facebook}" rel="noopener">Facebook</a></li>` : ''}${site.instagram ? `<li><a href="${site.instagram}" rel="noopener">Instagram</a></li>` : ''}</ul></div>
<div class="fc wide"><h2>${f.visit}</h2><address style="font-style:normal"><ul><li>${site.address.street}</li><li>${site.address.postalCode} ${site.address.locality}, Pelješac</li><li><a href="tel:${site.phoneHref}">${site.phone}</a></li><li><a href="mailto:${site.email}">${site.email}</a></li></ul></address></div>
</div>
<svg class="wordmark" viewBox="0 0 1000 150" aria-hidden="true" focusable="false"><text x="500" y="128" text-anchor="middle" textLength="990" lengthAdjust="spacing">VICELIĆ</text></svg>
<div class="base"><span>© ${new Date().getFullYear()} ${site.name} · ${site.legalName} · OIB ${site.oib}</span><span><a href="${href(L, 'terms')}">${f.terms}</a> · <a href="${href(L, 'privacy')}">${f.privacy}</a></span></div>
</div></footer>`;
}

function cartHtml(L) {
  const u = ui[L];
  return `<div class="drawer" id="cart" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="cart-h"><div class="scrim"></div><div class="panel">
<header><p id="cart-h" class="caps">${u.cart}</p><button type="button" class="close" aria-label="${u.close}">${icons.close}</button></header>
<div class="items"></div>
<footer hidden><div class="tot"><span class="caps-s">${u.total}</span><span class="price"></span></div>
<button type="button" class="btn full" data-checkout="email">${icons.mail.replace('<svg', '<svg width="16" height="16"')} ${u.orderEmail}</button>
<button type="button" class="btn btn-ghost full" data-checkout="whatsapp">${icons.wa.replace('<svg', '<svg width="16" height="16"')} ${u.orderWa}</button>
<p class="note">${u.cartNote}</p></footer></div></div>`;
}

function schemaFor(L, page) {
  const winery = {
    '@type': ['Winery', 'LocalBusiness'], '@id': `${site.url}/#winery`, name: site.name, alternateName: ['Vicelić Winery', 'Butik vinarija Vicelić', 'Vinarija Vicelić'],
    url: site.url + '/', email: site.email, telephone: site.phone, image: abs(photoUrl('hero') || '/og-default.jpg'),
    address: { '@type': 'PostalAddress', streetAddress: site.address.street, postalCode: site.address.postalCode, addressLocality: site.address.locality, addressRegion: 'Dubrovačko-neretvanska županija', addressCountry: 'HR' },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lon },
    sameAs: [site.facebook, site.instagram].filter(Boolean),
    founder: undefined, employee: { '@type': 'Person', name: site.winemaker, jobTitle: L === 'hr' ? 'Vinar' : 'Winemaker' },
  };
  const graph = [
    { '@type': 'WebSite', '@id': `${site.url}/#website`, url: site.url + '/', name: site.name, inLanguage: ['hr', 'en'], publisher: { '@id': `${site.url}/#winery` } },
    winery,
  ];
  if (page.crumbs) graph.push({ '@type': 'BreadcrumbList', itemListElement: page.crumbs.map(([name, h], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(h) })) });
  if (page.product) {
    const w = wines[page.product];
    const p = {
      '@type': 'Product', name: `Vicelić ${w.nameFull || w.name}`, brand: { '@type': 'Brand', name: 'Vicelić' },
      category: L === 'hr' ? 'Vino' : 'Wine', description: page.desc, image: abs(photoUrl(`bottle-${w.slug}`) || '/og-default.jpg'),
      manufacturer: { '@id': `${site.url}/#winery` }, countryOfOrigin: 'HR',
      additionalProperty: [{ '@type': 'PropertyValue', name: L === 'hr' ? 'Sorta' : 'Grape variety', value: w.grape }, { '@type': 'PropertyValue', name: L === 'hr' ? 'Podrijetlo' : 'Origin', value: w.origin[L] }],
    };
    if (w.price != null) p.offers = { '@type': 'Offer', price: w.price.toFixed(2), priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: abs(href(L, page.key)), seller: { '@id': `${site.url}/#winery` } };
    graph.push(p);
  }
  return ld({ '@context': 'https://schema.org', '@graph': graph });
}

function layout(L, page) {
  const path = href(L, page.key === '404' ? 'home' : page.key);
  const canonical = abs(path);
  const ogImg = abs(photoUrl(page.og) || '/og-default.jpg');
  const u = ui[L];
  const products = Object.fromEntries(Object.values(wines).map(w => [w.slug, { name: w.nameFull || w.name, origin: w.origin[L], price: w.price, thumb: bottle(w.slug, L, { decorative: true, sizes: '56px' }) }]));
  const cfg = { locale: u.locale, email: site.email, whatsapp: site.whatsapp, shopUrl: href(L, 'shop'), products, i18n: u };
  const alt = page.key !== '404' ? `<link rel="alternate" hreflang="hr" href="${abs(href('hr', page.key))}">
<link rel="alternate" hreflang="en" href="${abs(href('en', page.key))}">
<link rel="alternate" hreflang="x-default" href="${abs(href('hr', page.key))}">` : '';
  const hm = page.hero && page.og && imgs[page.og];
  const heroPre = hm ? `<link rel="preload" as="image" type="image/avif" imagesrcset="${hm.widths.map(w => `/img/${page.og}-${w}.avif ${w}w`).join(', ')}" imagesizes="100vw" fetchpriority="high">` : '';
  const sticky = page.sticky ? `<div class="sticky-cta" aria-hidden="false">${page.stickyXp
    ? `<a class="pri" href="#rezervacija">${L === 'hr' ? 'Rezerviraj' : 'Reserve'}</a><a href="https://wa.me/${site.whatsapp}" rel="noopener">${icons.wa} WhatsApp</a>`
    : `<a href="${href(L, 'shop')}">${u.nav.shop}</a><a class="pri" href="${href(L, 'experience')}#rezervacija">${L === 'hr' ? 'Degustacija' : 'Book a tasting'}</a>`}</div>` : '';
  return `<!doctype html>
<html lang="${L}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.desc)}">
${page.noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<link rel="canonical" href="${canonical}">
${alt}
<meta property="og:type" content="${page.product ? 'product' : 'website'}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:locale" content="${u.ogLocale}">
<meta property="og:locale:alternate" content="${ui[other(L)].ogLocale}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImg}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.desc)}">
<meta name="twitter:image" content="${ogImg}">
<meta name="theme-color" content="#111111">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/serif-300-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/jost-500-latin.woff2" as="font" type="font/woff2" crossorigin>
${heroPre}
<link rel="stylesheet" href="/assets/site.css?v=${V}">
<script>document.documentElement.classList.add('js')</script>
${schemaFor(L, page)}
</head>
<body>
${navHtml(L, page.key)}
${page.body}
${footerHtml(L)}
${cartHtml(L)}
${sticky}
<script type="application/json" id="cfg">${JSON.stringify(cfg).replace(/</g, '\\u003c')}</script>
<script src="/assets/site.js?v=${V}" defer></script>
</body>
</html>`;
}

// ─── Render ──────────────────────────────────────────────────────────────────
function finalize(html, filePath) {
  if (!PREVIEW) return html;
  // Rewrite root-relative URLs to relative ones (+ explicit index.html) so the site works from any base path
  const fromDir = dirname(relative(out, filePath)) || '.';
  const rel = p => {
    const [pathPart, rest = ''] = p.split(/(?=[?#])/);
    let target = pathPart.replace(/^\//, '');
    if (target === '' || target.endsWith('/')) target += 'index.html';
    let r = posix.relative(fromDir === '.' ? '' : fromDir, target) || 'index.html';
    return r + rest;
  };
  return html
    .replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_, a, p) => `${a}="${rel('/' + p)}"`)
    .replace(/srcset="([^"]+)"/g, (_, s) => `srcset="${s.split(', ').map(x => x.startsWith('/') ? rel(x.split(' ')[0]) + ' ' + x.split(' ')[1] : x).join(', ')}"`)
    .replace(/url\(\.\.\/fonts/g, 'url(../fonts')
    .replace(/"shopUrl":"\/([^"]*)"/, (_, p) => `"shopUrl":"${rel('/' + p)}"`);
}

const written = [];
for (const L of ['hr', 'en']) {
  for (const fn of [...pages, notFound]) {
    const page = fn(L);
    const html = layout(L, page);
    const file = page.key === '404' ? join(out, L === 'hr' ? '404.html' : 'en/404.html') : join(out, href(L, page.key), 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    // Inject cart thumbnails (small drawn bottles) into cfg without bloating markup
    writeFileSync(file, finalize(html, file));
    if (page.key !== '404') written.push({ L, key: page.key });
  }
}

// Sitemap with hreflang alternates + image entries
const keys = [...new Set(written.map(w => w.key))];
const today = new Date().toISOString().slice(0, 10);
const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${keys.flatMap(k => ['hr', 'en'].map(L => `<url><loc>${abs(href(L, k))}</loc><lastmod>${today}</lastmod>
<xhtml:link rel="alternate" hreflang="hr" href="${abs(href('hr', k))}"/><xhtml:link rel="alternate" hreflang="en" href="${abs(href('en', k))}"/><xhtml:link rel="alternate" hreflang="x-default" href="${abs(href('hr', k))}"/>
</url>`)).join('\n')}
</urlset>`;
writeFileSync(join(out, 'sitemap.xml'), sm);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
writeFileSync(join(out, 'site.webmanifest'), JSON.stringify({ name: site.name, short_name: 'Vicelić', start_url: '/', display: 'standalone', background_color: '#F1ECE3', theme_color: '#111111', icons: [{ src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }] }));
console.log(`Built ${written.length} pages → ${relative(root, out)}/${PREVIEW ? ' (preview mode)' : ''}`);
