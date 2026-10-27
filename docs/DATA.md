# Data, sources and verification

## Principles

1. Unknown values stay `NULL` — never zero, never an estimate.
2. Every important fact links to a `data_sources` row and has a `verification_state`:
   `unverified` → `owner_submitted` / `third_party_sourced` → `editor_verified` → `officially_verified`.
3. Public claims that imply quality or eligibility — **awards, certifications** — are shown only at `editor_verified` or `officially_verified`.
   Facilities and experiences are shown when supported by a source (`owner_submitted` or better).
4. Duplicates are flagged, never merged automatically.
5. Content written by the team is marked `draft` until an expert reviews it; the site shows an "Editorial draft" notice. Missing translations fall back to the other language with a visible note — machine translations are never presented as reviewed text.

## What the launch dataset contains — and how it was checked

Compiled in October 2026 without direct web access (only a web-search tool returning summaries).

| Data | Basis | Seeded state |
|---|---|---|
| 4 regions, 12 subregions | NN 76/2019 structure, confirmed through a search summary; NN 81/2022 (*Pravilnik o vinogradarstvu*) is the current rulebook | `third_party_sourced` |
| Districts Srijem, Erdut, Baranja | Search summary of NN 76/2019 | `third_party_sourced` |
| Districts Kutjevo, Pelješac, Korčula, Hvar, Vis | Earlier rulebooks / editorial knowledge | `unverified` — confirm against the NN 81/2022 annex |
| Vineyard sites Dingač, Postup | Widely published | `unverified` |
| 46 wineries: name, home settlement, region | Widely published | `unverified`, or `third_party_sourced` where a cited article/directory supports it |
| Websites | Official domains as widely published; **not re-opened live** | listed as a source "not yet re-checked" |
| Coordinates | Settlement centroids from editorial knowledge | precision `settlement`/`approximate` (labelled publicly) |
| Addresses | Only where a cited source published one (Toreta, Bodren, Jakopić) | `third_party_sourced` |
| Wines | Well-known labels; some confirmed by cited reviews (Falstaff, Decanter review) | `unverified` / `third_party_sourced` |
| Facilities & experiences | Only where a cited listing documents them (Bolfan, Katunar, Toreta, Bire, Skaramuča, Bodren) | `third_party_sourced` |
| Grape varieties | Widely published ampelography; content marked draft | `unverified` |
| Vineyard statistics, prices, awards, opening hours, photos | **None seeded** | — |

**Recommended first editorial tasks**: open each winery website and record a verification; geocode cellar addresses; import the vinogorja annex of NN 81/2022; invite owners to claim profiles.

## Legally usable sources to expand coverage

- Official registers (e.g. the wine producers register kept by the Ministry of Agriculture / APPRRR): check what is public and whether reuse is permitted before importing. Do not assume registry data may be republished.
- Regional wine associations and tourist boards (often publish member lists and wine roads) — ask for permission or use only factual data with attribution.
- Published competition results (for awards only, linked to the exact wine and vintage).
- Direct submissions from wineries (claim / list-your-winery forms).

Respect robots.txt, terms of use, copyright, database rights and privacy. Do not scrape indiscriminately.

## CSV import

Template: `public/templates/wineries-import-template.csv`. Required columns: `name`, `region` (slug), `town`, `source_name`.
Optional: `slug, subregion, district, island, municipality, county, address, postal_code, lat, lng, precision, website, email, phone, founded_year, family_run (yes/no), size_category, grapes (slugs separated by ;), signature_grapes, short_hr, short_en, source_url, verification, status`.

Rules enforced by `src/lib/importer.ts`:
- Region/subregion/district slugs must exist and be consistent; grape slugs must exist; coordinates must lie within Croatia's bounding box; URLs must be http(s).
- A row updates an existing winery **only if it names that winery's slug explicitly**. A derived slug collision, the same normalised name, the same website domain, or a similar name within 2 km → the row is skipped as a *possible duplicate*.
- Dry run by default (UI and CLI). Every run is recorded in `data_import_jobs` with a per-row report.

CLI: `npm run import:wineries -- file.csv` (dry run) and `-- file.csv --commit`.

## Boundary geometry

No region polygons are bundled, because no authoritative geometry was available. To add them:

```bash
npm run import:geometry -- --level=region --file=regions.geojson --key=slug \
  --source-name="<publisher and dataset name>" --source-url=https://... --dry-run
```

Levels: `region`, `subregion`, `district`, `site`. Features are matched by slug or official name; unmatched or invalid features are reported and skipped. Once imported, the map shows polygons automatically (`/api/map/regions`).

## Translations

UI strings live in `messages/hr.json` and `messages/en.json` (type-checked to have identical keys). Content fields are stored per language (`content.hr`, `content.en`) with a `status` (`draft`, `owner_original`, `reviewed`). Owners and editors edit both languages side by side.
