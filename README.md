# Croatian Wine Atlas · Atlas hrvatskih vinarija

*Discover the people, places and wines of Croatia. · Otkrijte ljude, krajolike i vina Hrvatske.*

A bilingual (Croatian/English), database-driven guide to Croatian wineries: an interactive wine map, advanced search, detailed winery profiles, a grape-variety encyclopedia, regional pages built on the official viticultural classification, a verified-awards database, tasting inquiries, a wine-route planner, a winery-owner portal and a full administration area.

The guiding rule is **discovery, authenticity, trust**: every fact carries its source and verification status, and missing information is shown as missing — never invented.

---

## Contents

- [Quick start](#quick-start)
- [What is built](#what-is-built)
- [Project structure](#project-structure)
- [Configuration](#configuration)
- [Database, migrations and seed data](#database-migrations-and-seed-data)
- [Running tests](#running-tests)
- [Deployment](#deployment)
- [Administrator guide](#administrator-guide)
- [Known limitations](#known-limitations)

Further documentation: [`docs/DATA.md`](docs/DATA.md) (sources, verification, imports, geometry) · [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/QA.md`](docs/QA.md).

---

## Quick start

Requirements: Node.js 22+, PostgreSQL 15+ with the **PostGIS**, **pg_trgm**, **unaccent** and **pgcrypto** extensions.

```bash
# 1. Database (as a PostgreSQL superuser)
createuser atlas -P            # password: atlas (development only)
createdb -O atlas atlas
psql -d atlas -c 'CREATE EXTENSION postgis; CREATE EXTENSION pg_trgm; CREATE EXTENSION unaccent; CREATE EXTENSION pgcrypto;'

# 2. App
cp .env.example .env.local     # then edit APP_SECRET etc.
npm install                    # also copies the MapLibre worker to public/vendor
npm run db:migrate
npm run db:seed:demo           # real winery dataset + DEMO users (development only!)
npm run dev                    # http://localhost:3000 → redirects to /hr
```

Demo accounts created by `db:seed:demo` (never use in production):

| Role    | Email               | Password            |
|---------|---------------------|---------------------|
| Admin   | admin@atlas.test    | atlas-admin-dev     |
| Editor  | editor@atlas.test   | atlas-editor-dev    |
| Owner (manages *Vinarija Toreta*) | owner@atlas.test | atlas-owner-dev |
| Visitor | visitor@atlas.test  | atlas-visitor-dev   |

For production, run `npm run db:seed` (no demo users) and create the first administrator with
`npm run user:create -- --email=you@example.com --role=admin --name="Your Name"`.

---

## What is built

**Public site (HR default, EN)** — localized URLs such as `/hr/vinarije/kozlovic` and `/en/wineries/kozlovic`; the language switcher keeps you on the equivalent page.

- **Homepage**: cinematic hero with live search suggestions and discovery shortcuts; a real interactive atlas of every listed winery; the four official regions with database-derived counts and key varieties; editor's picks (never paid; sponsored listings are labelled); grape shortcuts; documented experiences; stories; coverage note.
- **Interactive wine map** (`/karta`, `/map`): MapLibre GL with marker clustering, region colouring, popups, a synchronized results list, hover/selection sync, a sliding preview panel, filters, "search this map area", user-initiated geolocation with distance sorting, full screen, and a draggable mobile bottom sheet. Filters, search and map area are kept in the URL so searches can be shared. Markers are loaded for the current viewport only.
- **Directory** (`/vinarije`, `/wineries`): server-rendered, crawlable, paginated, with the same filters (works without JavaScript and if the map fails).
- **Search**: diacritic-insensitive (`dingac` → Dingač, `posip` → Pošip, `Djakovo` = Đakovo), typo-tolerant (pg_trgm), across winery names, places, counties, regions, districts, vineyard sites, islands, grapes and synonyms, wine names, people and competitions.
- **Filters**: region, subregion, district, island, town, distance; wine style, grape, indigenous varieties, verified certifications; producer type, family-run, founding year; facilities, languages, experience type, price, group size; verified awards by competition, medal and year.
- **Winery profiles**: identity, sticky section navigation, quick facts, contact & social, multiple locations (cellar/shop/vineyard), wines, grapes (estate-grown vs purchased), vineyard statistics with reference year and source, verified awards tied to wine and vintage, visitor experiences, gallery/lightbox, story, nearby and similar wineries, sources & verification, report-an-error and claim links, save/share/add-to-route/directions actions, mobile sticky contact bar, schema.org `Winery` data.
- **Encyclopedia**: regions → subregions → wine districts (vinogorja) → vineyard sites (e.g. Dingač, Postup); grape varieties (32) with synonyms, parentage, regions, wineries and wines; wines with vintages and technical data; awards database; experiences; editorial stories; curated routes.
- **Tasting inquiries** without an account: validation (Zod, client and server), honeypot + signed timing token, rate limits per IP and email, idempotency and duplicate detection, secure storage, visitor acknowledgement and winery notification via Resend — or an honest "queued/not delivered" state and admin-visible outbox when no provider is configured.
- **Route planner**: add stops from any profile or the map, reorder, share via URL, open in Google/Apple Maps, save to an account. Driving times appear only with a configured routing service (OSRM-compatible); otherwise the map draws a dashed stop-order line and says so — never a straight-line estimate.
- **Accounts (optional)**: saved wineries (device-local before sign-in, importable afterwards), saved routes, and a private "wine passport" of visited wineries.

**Winery owner portal** (`/vlasnik`, `/owner`): dashboard with profile completeness (explicitly *not* verification) and recommendations; bilingual profile editor (changes go to editor review); wines, vintages and technical data; award documentation (stored unverified until an editor checks official results); experiences; inquiry inbox with status and replies; photo/PDF uploads with rights confirmation and moderation.

**Administration** (`/admin`): dashboard with queues and data-quality indicators; winery management (classification, verified location precision, profile, owners, verification log); moderation of owner changes and media; ownership claims and listing requests; awards research/verification workflow; inquiries; error reports; users and roles; geography and region content; grapes; editorial articles; CSV import (dry run, validation, duplicate detection, history) and export; email outbox; audit log.

---

## Project structure

```
db/migrations/        SQL schema (PostGIS, trigram search, triggers)
db/seed/              Launch dataset: geography, grapes, wineries, editorial
messages/{hr,en}.json UI translations (type-checked: both files must have the same keys)
scripts/              migrate, seed, CSV import, geometry import, users, email, link check
src/app/[locale]/     Localized pages (public, account, owner, admin)
src/app/api/          JSON APIs (map markers, search, routing, media, exports)
src/app/actions/      Server actions (inquiries, auth, owner, admin, forms)
src/components/       UI (map, filters, winery, owner, admin, layout)
src/content/{hr,en}/  About, privacy and terms pages (Markdown)
src/i18n/             next-intl routing with localized pathnames
src/lib/              DB client, queries, auth, security, email, uploads, importer
tests/                unit, integration (DB) and Playwright end-to-end tests
```

---

## Configuration

All settings are environment variables — see [`.env.example`](.env.example).

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. Set `DATABASE_PREPARE=false` behind a transaction-mode pooler. |
| `APP_SECRET` | Required in production (≥16 chars). Signs form tokens, sessions and IP hashes. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, sitemaps and emails. |
| `NEXT_PUBLIC_MAP_STYLE_URL` | MapLibre style. Default: OpenFreeMap *Positron* (OpenStreetMap data, no key; keep attribution). |
| `ROUTING_OSRM_URL` | Optional OSRM-compatible routing service for driving times. |
| `RESEND_API_KEY`, `EMAIL_FROM` | Transactional email. Without a key, mail is stored as `no_provider`. |
| `EDITORIAL_EMAIL` | Receives inquiries for wineries without a public email, claims and contact messages. |
| `UPLOAD_DIR`, `UPLOAD_MAX_MB` | Local media storage (use a persistent volume in production). |
| `TEST_DATABASE_URL` | Separate database rebuilt by the test suites. |

---

## Database, migrations and seed data

```bash
npm run db:migrate          # apply db/migrations/*.sql in order (tracked in schema_migrations)
npm run db:seed             # idempotent: real wineries, grapes, geography, competitions, articles
npm run db:seed:demo        # + demo users (development / tests only)
npm run db:reset            # drop app tables (keeps extensions), migrate, seed with demo users
```

The seed never overwrites content an owner or editor has changed, nor locations an editor has taken over.

**Launch dataset**: 46 real producers across all four regions (Dalmatia 16, Istria & Kvarner 15, Slavonia & Danube 9, Central Uplands 6), 32 grape varieties, 12 official subregions, 8 wine districts, 2 vineyard sites, 6 competitions, 3 curated routes and 3 editorial drafts. All records start as *unverified* or *third-party sourced*; see [`docs/DATA.md`](docs/DATA.md) for exactly what was and was not verified.

---

## Running tests

```bash
npm run typecheck           # TypeScript strict
npm run lint                # ESLint (Next.js core-web-vitals + TypeScript)
npm test                    # Vitest: unit + DB integration (rebuilds TEST_DATABASE_URL)
npm run test:e2e            # Playwright: builds the app, serves it on :3100 against the test DB
```

The Playwright suite covers the 15 acceptance scenarios (desktop and mobile). See [`docs/QA.md`](docs/QA.md).

---

## Deployment

The app is a standard Next.js 16 server application.

1. **Database**: managed PostgreSQL with PostGIS (e.g. Supabase, Neon, AWS RDS, Crunchy Bridge). Enable `postgis`, `pg_trgm`, `unaccent`, `pgcrypto` once as a superuser, then run `npm run db:migrate` and `npm run db:seed` from CI or a one-off job.
2. **App**: Vercel, Render, Fly.io, a container or any Node host. Set the environment variables above; build with `npm run build`, start with `npm start`.
3. **Media**: `UPLOAD_DIR` must be persistent. On serverless platforms, mount a volume or replace `src/lib/uploads.ts` with an object-storage adapter (S3/Supabase Storage) — the rest of the app only uses `storeUpload`/`readUpload`.
4. **Email**: set `RESEND_API_KEY` and a verified `EMAIL_FROM` domain; schedule `npm run email:flush` (e.g. every 10 minutes) to retry failures.
5. **Maps**: OpenFreeMap needs no key. For high traffic, self-host tiles or use a commercial provider and set `NEXT_PUBLIC_MAP_STYLE_URL`. Keep the attribution visible.
6. **Monitoring**: errors are logged server-side with digests; plug in your error tracker (e.g. Sentry via `instrumentation.ts`). Analytics are intentionally not included — add a privacy-friendly, cookie-less tool or ask for consent first.

---

## Administrator guide

**Add a winery** — Admin › Wineries › *New winery* (creates a draft). Then set region/subregion/district, the primary location (choose *address* or *exact* precision only after confirming the position), contact details and bilingual content; record a verification with its source; set status to *published*. For many wineries use **Admin › Import** with the CSV template (`/templates/wineries-import-template.csv`): always run a dry run first; possible duplicates are skipped and reported, never merged.

**Verify information** — On the winery page use *Record verification* (method, source URL, notes). Verification levels are explained publicly on `/hr/price/how-the-atlas-verifies-information`. Run `npm run links:check` periodically to flag unreachable websites.

**Verify awards** — Admin › Awards: pick the exact wine, competition, year and vintage, paste the competition's official results URL and save as *officially verified*. Owner-submitted awards arrive as *owner_submitted* and stay invisible until you verify them. Do not use competition logos unless licensed.

**Approve owners** — Admin › Claims. Check that the claimant's email is on the winery's official domain or that they provided register/document evidence. Approval links the account that submitted the claim; for claimants without an account, add them later on the winery page (*Add owner*) once they register. Owners' profile edits appear under Admin › Changes with a field-by-field diff.

**Upload images** — Owners (or editors via the owner tools linked from the winery admin page) upload JPEG/PNG/WebP/PDF files after confirming rights; files are type-checked by content, stored under random names and appear publicly only after approval in Admin › Changes. Set an approved image as cover or logo in the media manager. Never publish stock photos as photos of a specific winery.

**Update regional content** — Admin › Geography: edit each region's bilingual text and mark it *reviewed* after expert review (until then the site shows an "editorial draft" note). Add wine districts only from the regulation's annex with its URL. Import boundary polygons with `npm run import:geometry` (see `docs/DATA.md`).

---

## Known limitations

- **Coverage**: 46 wineries — not every Croatian winery. The coverage page states this; expansion is via owner listings, claims and the CSV pipeline.
- **Verification**: the build environment had no direct web access. Facts were compiled from published sources and web-search summaries; winery websites were not re-opened live, so records are marked *unverified* unless a cited third-party source supports them. Coordinates are **settlement-level approximations** and are labelled as such.
- **Official geography**: four regions and twelve subregions are seeded from NN 76/2019 (confirmed via a secondary summary); NN 81/2022 now holds the district (vinogorje) lists in an annex that still needs editorial import. **No boundary polygons are included** — the map colours wineries by region instead of drawing approximate borders.
- **Photography**: no licensed photographs were available, so pages use generated landscape illustrations, clearly labelled "Illustration". Real photos appear automatically once owners upload and editors approve them.
- **Awards**: none are seeded, because none could be matched to official results here. The workflow is complete and tested.
- **Email** is stored but not delivered until `RESEND_API_KEY` is set. **Driving times** need `ROUTING_OSRM_URL`.
- **Email verification / password reset** for accounts are not implemented yet (ownership is therefore never granted by email match).
- The admin interface is in English; public pages and the owner portal are fully bilingual.
- AI-assisted discovery ("Find my wine experience") is planned, not built.
