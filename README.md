# Boutique Winery Vicelić — website

A redesign of vicelic.hr as a static, bilingual (HR/EN) editorial site. Dingač is the hero, Plavac Mali the grape, Pelješac the place.

- **No framework, no runtime dependencies.** Plain HTML, CSS and about 10 KB of JavaScript. It can be hosted anywhere static (Netlify, Cloudflare Pages, GitHub Pages, any web server).
- **Typography:** Noto Serif Display (display, editorial) + Jost (navigation, metadata). Both are self-hosted and subset; Croatian diacritics are included.
- **Palette:** charcoal `#111`, limestone `#F1ECE3`, Dingač soil `#9B4A35`, Plavac `#541D26`, olive used sparingly.

## Commands

```bash
npm install
npm run build     # optimise photos + build → dist/
npm run serve     # http://localhost:4173
npm run preview   # build with relative links → preview/ (opens from disk)
```

## Structure

```
src/content.mjs     ← ALL facts: wines, specs, contact, prices, photo slots (edit here)
src/pages.mjs       ← page templates + editorial copy (HR/EN)
src/i18n.mjs        ← UI strings, navigation, URL routes
src/lib.mjs         ← image/bottle/markup helpers
src/build.mjs       ← layout, SEO (meta, OG, hreflang, JSON-LD), sitemap, robots
src/images.mjs      ← responsive image pipeline (AVIF/WebP/JPG)
src/map.mjs         ← generates the Pelješac coastline map from Natural Earth data
src/assets/         ← site.css, site.js
src/fonts/          ← subset woff2 files
assets/photos/      ← put photographs here (see README inside)
AUDIT.md            ← what is verified, what must be confirmed, what is missing
```

## Pages (identical slugs in HR `/…` and EN `/en/…`, matching the current site's pattern)

| | |
|---|---|
| `/` | Home: cinematic editorial journey in 10 chapters |
| `/o-nama/` | Our story |
| `/dingac/` | Flagship page: vineyard → terroir → viticulture → harvest/cellar → tasting → serving → buy |
| `/vina/` | The wines |
| `/vina/plavac-mali/` · `/vina/opolo-rose/` | Wine pages, each with its own character |
| `/iskustvo/` | Private wine experience + reservation (email / WhatsApp) |
| `/shop/` · `/product/<wine>/` | Shop + product pages (existing `/en/product/opolo-rose/` URL kept) |
| `/kontakt/` · `/uvjeti-kupnje/` · `/privatnost/` | Contact, terms, privacy |

## Commerce

The cart lives in the browser (localStorage). Checkout sends a pre-filled order by **email** or **WhatsApp**, so the winery confirms availability, shipping and payment personally. No shipping policy is invented. To add card payment, set a **Stripe Payment Link** per wine in `src/content.mjs`. A multi-item Stripe Checkout needs a small serverless function; that is the next step once the current Stripe setup is known.

## SEO

Per-page titles and descriptions in both languages, canonical URLs, `hreflang` hr/en/x-default, OpenGraph and Twitter cards, and JSON-LD: `Winery`/`LocalBusiness`, `WebSite`, `BreadcrumbList`, and `Product` (with `Offer` once prices are set). Also `sitemap.xml` with alternates, `robots.txt`, semantic headings and bilingual alt text.

## Verification mode

Append `?audit` to any URL to outline every fact that still needs confirmation (see `AUDIT.md`).
