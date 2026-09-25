# Vicelić Boutique Winery — website

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · next-intl (EN/HR).
This is a proposal build: payments run in Stripe **test mode** only.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in later stages' keys
npm run dev                  # http://localhost:3000 → /en
```

| Command | What it does |
|---|---|
| `npm run build` | Validates content, then builds a production bundle |
| `npm run check:content` | Validates every content file against its schema |
| `npm run typecheck` / `npm run lint` | TypeScript / ESLint |
| `npm test` | Unit tests (availability, pricing) |
| `npm run screenshots` | With `npm start` running: screenshots at 390 px and 1440 px into `screenshots/` |
| `node scripts/e2e-booking.mjs` / `node scripts/e2e-shop.mjs` | Book a tasting / buy wine end to end in a real browser (demo payment) |
| `node scripts/a11y.mjs` | axe-core WCAG 2.1 AA audit of the main pages |

## Static preview on GitHub Pages

`node scripts/build-static.mjs` builds a static copy of the site into `./out` (all pages, both
languages, animations, calendar computed in the browser, cart). Payments, emails, stored bookings
and `/admin` need a server, so in the preview those steps show a "preview of the design" notice.
`.github/workflows/pages.yml` builds and publishes it on every push. One-time setup: the
repository must be public (or on GitHub Pro), and Settings → Pages → Source must be "GitHub Actions".

## Preview on Vercel (no configuration needed)

Import the GitHub repo at vercel.com → Add New → Project → Deploy. With no environment
variables the site runs in proposal mode: demo payments, emails written to a temporary outbox,
and an embedded database in `/tmp` — so test bookings and orders on a preview are **temporary**
(they disappear when the server instance restarts). Set `ADMIN_PASSWORD` to open `/admin`.
For real use add the variables from `.env.example` (Postgres, Stripe, Resend).

## Booking

Real availability, built in (`src/lib/booking/`): seasons, weekly slots, capacity per slot,
blackout dates, a 12 h lead time and a booking horizon — all from `content/experiences.ts`
and `content/availability.ts`.

1. The guest picks a tasting, a date, a time and the number of guests (children free).
2. `POST /api/booking/checkout` re-checks availability and **holds the seats for 35 min**
   inside a transaction with a per-slot lock, so the last seats can never be sold twice.
3. Payment: **Stripe Checkout** (EUR, cards + Apple Pay / Google Pay) when `STRIPE_SECRET_KEY`
   is set; otherwise a **demo checkout** page so the whole flow can be shown without keys.
4. On payment (Stripe webhook, or the success page if the webhook is late) the booking is
   confirmed once, and the guest and the winery get an email with an `.ics` invitation,
   WhatsApp link and directions.
5. Abandoned or expired payments release the seats.

Winter seasons marked `onRequestOnly` show a request form instead of payment.
`/admin` (Basic auth, `ADMIN_PASSWORD`) lists bookings and blocks dates or single slots.

**Stripe test mode**
```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_…
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…   # from: stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Test card: `4242 4242 4242 4242`, any future date, any CVC.

`npm test` runs the availability unit tests; `node scripts/e2e-booking.mjs` books a tasting
end to end in a real browser (needs `npm start` running).

**Why not Bókun / FareHarbor now?** Only the website and WhatsApp sell tastings today. The
booking code sits behind one module (`src/lib/booking/store.ts`), so moving to Bókun when
Viator / GetYourGuide are added means replacing that module, not the pages.

## Shop

`content/products.ts` (prices, stock at launch), `content/shipping.ts` (zones). Three wines ×
bottle / case of 3 / case of 6, plus the gift box. The cart lives in the browser; the server
re-prices every checkout from the catalogue (VAT-inclusive, 25 %), checks the delivery zone
(Croatia, EU, pickup — the US and non-EU are refused with a note) and stock, then opens Stripe
Checkout (or the demo checkout). Stock is decremented once, when payment is confirmed.
Order emails go to the customer and to `WINERY_NOTIFY_EMAIL`. `/admin` shows paid orders and stock.
`node scripts/e2e-shop.mjs` buys a case and a gift box end to end.

## Where things live

- `content/` — **all copy and data**. Edit here, never in components.
  - `messages/en.ts`, `messages/hr.ts` — interface strings (HR mirrors EN; a missing key fails the build). Croatian lines marked `// REVIEW`.
  - `site.ts` — estate facts (address, contacts, VAT)
  - `image-slots.ts` — every photo/video slot with art direction and alt text (doubles as the shot list)
- `src/app/[locale]/` — pages. `/en/design` shows the design system (not indexed).
- `src/components/layout/` — header, footer, age gate, cookie notice, sticky booking bar, WhatsApp button
- `src/styles/globals.css` — design tokens, grain, motion
- `CONTENT_TODO.md` — every placeholder the owner needs to supply or confirm

## Design system

| Token | Hex | Use |
|---|---|---|
| bone | `#EDE7DC` | Main light surface |
| limestone | `#F7F4EE` | Raised light surface |
| ink-soft | `#5C564D` | Secondary text on light (5.9:1) |
| basalt | `#121110` | Dark sections, main text |
| charcoal | `#1E1C1A` | Dark raised surface |
| stone-light | `#A39C90` | Secondary text on dark (6.9:1) |
| plavac | `#3B0A12` | Brand, primary buttons |
| plavac-deep | `#22060A` | Cellar, tunnel |
| sun | `#B8975A` | Accent on dark; ornament only on light |
| sun-pale | `#D9C49C` | Accent text and buttons on dark |
| sun-deep | `#7A6130` | Gold as text on light (4.8:1) |
| adriatic | `#0E2A3D` | Almost never |

Type: **Newsreader** (display, variable with optical sizes), **Hanken Grotesk** (body/UI), **IBM Plex Mono** (technical sheets). All are self-hosted and cover Croatian diacritics.

## SEO

- Per-page titles and descriptions, canonical URLs and `hreflang` (en, hr, x-default) — `src/lib/seo.ts`
- `sitemap.xml` (both languages, with alternates) and `robots.txt` (checkout, cart, admin excluded)
- Open Graph images generated at build time (`opengraph-image.tsx`: one site-wide, one per wine dossier)
- JSON-LD: `Winery` + `WebSite` (home, visit), `TouristAttraction` with offers and `FAQPage` (experience),
  `Product` with offers (dossiers, shop)
- Set `NEXT_PUBLIC_SITE_URL` to the production domain before deploying — every absolute URL derives from it.

## Quality (proposal build, measured locally)

- Lighthouse mobile (simulated slow 4G): Accessibility 100, Best practices 100, SEO 100; Performance 85–91
  depending on the page and run (median ≈ 88). Re-measure on the real host with real photography.
- axe-core: 0 WCAG 2.1 AA violations on the 12 main pages. No horizontal scroll at 360 px on any page.
- Fonts are self-hosted; Newsreader is instanced at its display optical size (`scripts/build-fonts.py`).

## Before going live

1. Owner fills everything in `CONTENT_TODO.md` (🔴 first): prices, stock, photos, verified history, legal details.
2. A lawyer reviews `content/legal.ts` (pages show a draft notice until `draft: false`).
3. Stripe account in the OPG's name → live keys + webhook endpoint `/api/stripe/webhook`.
4. Postgres (`DATABASE_URL`), Resend with a verified domain, `WINERY_NOTIFY_EMAIL`, `ADMIN_PASSWORD`.
5. EU shipping only once excise / tax representation is arranged (`content/shipping.ts` → `enabled`).
6. Domain + redirects from the old vicelic.hr WordPress URLs; Plausible site.
