// Shared rendering helpers
import { readFileSync, existsSync } from 'node:fs';
import { site, wines, photos } from './content.mjs';

const root = new URL('..', import.meta.url).pathname;
const manifestPath = root + 'src/generated/images.json';
export const imgs = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};

export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const pick = (v, L) => (v && typeof v === 'object' && 'hr' in v && 'en' in v) ? v[L] : v;
export const vflag = f => f ? ' data-verify' : '';

export const arrow = '<svg class="arr" viewBox="0 0 18 8" aria-hidden="true"><path d="M0 4h17M13.5.5 17 4l-3.5 3.5" fill="none" stroke="currentColor"/></svg>';

export const icons = {
  cart: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 6.5h13l-1 11h-11l-1-11Z M7 8V5a3 3 0 0 1 6 0v3" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>',
  wa: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.2a6.7 6.7 0 0 0-5.8 10.1L1.2 14.8l3.6-.9A6.7 6.7 0 1 0 8 1.2Z M5.6 4.7c.2 0 .4 0 .5.4l.6 1.4c0 .2 0 .3-.1.4l-.4.5c-.1.1-.1.3 0 .4.5.9 1.2 1.6 2.1 2.1.2.1.3.1.4 0l.5-.6c.1-.1.3-.2.4-.1l1.4.7c.2.1.3.2.3.4 0 .8-.6 1.5-1.4 1.6-.4 0-.8.1-2.3-.6a7.7 7.7 0 0 1-3-2.7c-.4-.6-.7-1.2-.7-1.9 0-.6.3-1.2.7-1.6.1-.2.3-.2.5-.2Z" fill="currentColor"/></svg>',
  mail: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 3.5h13v9h-13z M1.5 3.5 8 9l6.5-5.5" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>',
  close: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2 2l12 12M14 2 2 14" stroke="currentColor" stroke-width="1.1"/></svg>',
};

// Split "Line one|Line two" into masked reveal lines
export const lines = (s, tag = 'span') => s.split('|').map(x => `<span><span>${x}</span></span>`).join('');

// ─── Photography ─────────────────────────────────────────────────────────────
// media(slot, L, {ratio, sizes, eager, pos, cls, parallax, label})
export function media(slot, L, o = {}) {
  const p = photos[slot] || { tone: 'stone', alt: { hr: '', en: '' } };
  const alt = esc(pick(p.alt, L));
  const cls = ['media', o.ratio ? `ratio-${o.ratio}` : '', o.reveal === false ? '' : 'reveal-img', o.cls || ''].filter(Boolean).join(' ');
  const style = o.pos ? ` style="--pos:${o.pos}"` : '';
  const par = o.parallax ? ` data-parallax="${o.parallax}"` : '';
  const m = imgs[slot];
  if (!m) {
    return `<figure class="${cls}"${style}${par}><div class="ph" data-tone="${p.tone}" role="img" aria-label="${alt}"><span class="ph-l">${L === 'hr' ? 'Fotografija' : 'Photograph'} · ${alt}</span></div></figure>`;
  }
  const sizes = o.sizes || '100vw';
  const set = ext => m.widths.map(w => `/img/${slot}-${w}.${ext} ${w}w`).join(', ');
  const largest = m.widths.at(-1);
  const load = o.eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"';
  return `<figure class="${cls}"${style}${par}><picture>
<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
<img src="/img/${slot}-${largest}.${m.fallback}" srcset="${set(m.fallback)}" sizes="${sizes}" width="${m.width}" height="${m.height}" alt="${alt}" ${load} decoding="async" style="background:url(${m.lqip}) center/cover"></picture></figure>`;
}
export const photoUrl = slot => imgs[slot] ? `/img/${slot}-${imgs[slot].widths.find(w => w >= 1200) || imgs[slot].widths.at(-1)}.${imgs[slot].fallback}` : null;

// ─── Bottle (packshot or drawn placeholder) ──────────────────────────────────
let bid = 0;
export function bottle(id, L, o = {}) {
  const w = wines[id];
  const slot = `bottle-${id}`;
  const m = imgs[slot];
  const alt = esc(pick(photos[slot]?.alt, L));
  if (m) {
    const set = ext => m.widths.map(x => `/img/${slot}-${x}.${ext} ${x}w`).join(', ');
    return `<picture class="bottle"><source type="image/avif" srcset="${set('avif')}" sizes="${o.sizes || '40vw'}"><source type="image/webp" srcset="${set('webp')}" sizes="${o.sizes || '40vw'}"><img class="bottle" src="/img/${slot}-${m.widths.at(-1)}.${m.fallback}" width="${m.width}" height="${m.height}" alt="${alt}" ${o.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
  }
  const b = w.bottle, n = ++bid;
  const name = esc(w.name).toUpperCase();
  const clear = b.clear;
  return `<svg class="bottle" viewBox="0 0 140 520" role="img" aria-label="${alt}" ${o.decorative ? 'aria-hidden="true"' : ''}>
<defs>
<linearGradient id="g${n}" x1="0" x2="1"><stop offset="0" stop-color="${b.glass}" stop-opacity="${clear ? .55 : 1}"/><stop offset=".22" stop-color="${clear ? '#fff' : '#5a4a44'}" stop-opacity="${clear ? .7 : .55}"/><stop offset=".32" stop-color="${b.glass}" stop-opacity="${clear ? .5 : 1}"/><stop offset=".85" stop-color="${clear ? '#cbbfae' : '#000'}" stop-opacity="${clear ? .6 : 1}"/><stop offset="1" stop-color="${b.glass}" stop-opacity="${clear ? .7 : 1}"/></linearGradient>
<clipPath id="c${n}"><path d="M56 6h28v112c0 18 40 38 40 72v312c0 7-4 12-11 12H27c-7 0-11-5-11-12V190c0-34 40-54 40-72Z"/></clipPath>
</defs>
<ellipse cx="70" cy="516" rx="58" ry="4" fill="#000" opacity=".22"/>
<g clip-path="url(#c${n})">
<rect width="140" height="520" fill="url(#g${n})"/>
${clear ? `<rect y="150" width="140" height="370" fill="${b.wine}" opacity=".85"/><rect y="150" width="140" height="370" fill="url(#g${n})" opacity=".55"/>` : ''}
<rect x="50" y="0" width="40" height="92" fill="${clear ? '#e8dccb' : '#120d0c'}"/>
<rect x="50" y="88" width="40" height="3" fill="${b.accent}" opacity=".8"/>
<rect x="16" y="262" width="108" height="150" fill="${b.label}"/>
<rect x="16" y="262" width="108" height="150" fill="url(#g${n})" opacity=".18"/>
</g>
<text x="70" y="300" text-anchor="middle" font-family="Serif Display,Georgia,serif" font-size="15" letter-spacing="4.5" fill="${b.ink}">VICELIĆ</text>
<line x1="56" x2="84" y1="312" y2="312" stroke="${b.ink}" stroke-width=".6" opacity=".6"/>
<text x="70" y="${name.length > 7 ? 344 : 348}" text-anchor="middle" font-family="Serif Display,Georgia,serif" font-size="${name.length > 7 ? 13 : 19}" letter-spacing="${name.length > 7 ? 2.5 : 3}" fill="${b.ink}">${name}</text>
<text x="70" y="392" text-anchor="middle" font-family="Jost,sans-serif" font-size="5.5" letter-spacing="2.4" fill="${b.ink}" opacity=".7">PELJEŠAC · HRVATSKA</text>
</svg>`;
}

// JSON-LD
export const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
