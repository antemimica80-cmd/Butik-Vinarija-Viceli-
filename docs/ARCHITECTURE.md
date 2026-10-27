# Architecture

## Stack

- **Next.js 16** (App Router, React 19, server components, server actions, Turbopack), TypeScript strict.
- **Tailwind CSS 4** with design tokens in `src/app/globals.css` (forest #193C34, ivory #F5F1E8, burgundy #792E39, brass #BD9B65, stone #8A857B, ink #222522; AA-contrast text variants). Typography: **EB Garamond** (display; chosen over Cormorant because its Croatian diacritics render correctly) and **DM Sans** (UI).
- **next-intl 4** with localized pathnames (`src/i18n/routing.ts`); Croatian is the default locale; hreflang/canonical metadata via `src/lib/seo.ts`.
- **PostgreSQL + PostGIS**, accessed with the `postgres` driver and parameterised tagged SQL (no ORM — spatial and trigram queries are clearer in SQL). Raw SQL migrations in `db/migrations`.
- **MapLibre GL JS 6** with OpenFreeMap tiles; the worker is served from `/public/vendor`. A plain fallback base layer keeps markers usable if tiles fail.
- **Zod 4** validation shared by client (React Hook Form) and server actions.
- **Resend** for email via a durable `email_outbox`.

## Data model (main tables)

Geography: `wine_regions → wine_subregions → wine_districts → vineyard_sites`, plus separate `appellations` (PDO/PGI). Each has bilingual `name`/`content` and optional `geom` (MultiPolygon, SRID 4326).

Wineries: `wineries` (identity, bilingual content, contacts, classification, verification), `winery_locations` (geography points, kind = winery/tasting room/shop/vineyard, precision), `winery_stats` (metric + value + reference year + source), `winery_facilities`, `winery_certifications`, `vineyards`, `winery_grape_varieties` (grown/purchased), `media`.

Wines: `wines`, `wine_vintages`, `wine_grape_compositions` (per wine or vintage, with percentage), `competitions`, `wine_awards` (a trigger guarantees the award's winery matches the wine's winery and the vintage belongs to the wine).

Visits: `tasting_experiences`, `tasting_inquiries` (+ `inquiry_events`), `email_outbox`.

People & workflow: `users`, `sessions`, `winery_owners`, `ownership_claims`, `change_requests`, `data_reports`, `favorites`, `winery_visits`, `wine_routes`, `wine_route_stops`, `editorial_articles`.

Provenance & operations: `data_sources`, `data_verifications`, `data_import_jobs`, `audit_log`, `rate_limit_events`.

## Search

`atlas_norm()` (SQL, immutable) and `norm()` (TypeScript) lower-case, strip diacritics and fold "dj"→"d". `refresh_winery_search(id)` builds a denormalised `search_norm` document per winery from its names, places, region hierarchy, grapes, wines, vineyard sites, people and verified-award competitions. Queries match each token by substring or `word_similarity` (GIN trigram indexes) and rank exact/prefix name matches first. Wines and grapes have their own search documents.

## Map scalability

The browser never downloads all records: `/api/map/markers` returns lightweight GeoJSON for the current viewport (+ padding) and active filters; the list is paginated server-side. Clustering happens in MapLibre. Region polygons load separately and only if imported.

## Security

- Sessions: random 256-bit tokens, stored as HMAC hashes, httpOnly/SameSite=Lax/Secure cookies, 30-day expiry. Passwords: scrypt.
- Authorisation is enforced server-side in every server action and page (`requireWineryManager`, `requireStaff`, `requireAdmin`); owners can only touch their own winery's rows (every query is scoped by winery id).
- Public forms: Zod validation, honeypot, HMAC-signed timing token, Postgres-backed rate limits, idempotency keys, duplicate detection. Raw IPs are never stored (keyed hash only).
- Uploads: size limit, content sniffing (JPEG/PNG/WebP/PDF only — no SVG/HTML), random filenames, path-traversal checks; served with `nosniff`, sandboxed CSP, and access control for unapproved files.
- Owner-entered URLs must be http(s) (no `javascript:` links). Markdown rendering never emits raw HTML. Map popups are built with text nodes.
- Security headers in `next.config.ts`; server actions use Next.js origin checks.
- Ownership is never granted by matching an (unverified) email address.

## Rendering

Public pages render on demand (`force-dynamic`) so editorial changes appear immediately; responses from JSON APIs carry short cache headers. For higher traffic, switch hot pages to ISR with `revalidatePath` calls in the server actions (already present) and a CDN.
