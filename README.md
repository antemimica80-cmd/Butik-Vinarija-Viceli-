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
| `npm run screenshots` | With `npm start` running: screenshots at 390 px and 1440 px into `screenshots/` |

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
