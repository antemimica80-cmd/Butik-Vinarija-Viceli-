-- Croatian Wine Atlas — initial schema
-- PostgreSQL 15+ with PostGIS, pg_trgm, unaccent, pgcrypto.

create extension if not exists postgis;
create extension if not exists pg_trgm;
create extension if not exists unaccent;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Text normalisation used for diacritic-insensitive search.
-- "Pošip" -> "posip", "Dingač" -> "dingac", "Đakovo"/"Djakovo" -> "dakovo".
-- ---------------------------------------------------------------------------
create or replace function atlas_norm(t text) returns text
language sql immutable parallel safe as $$
  select regexp_replace(
           lower(public.unaccent('public.unaccent'::regdictionary, coalesce(t, ''))),
           'dj', 'd', 'g')
$$;

-- ---------------------------------------------------------------------------
-- Enumerations
-- ---------------------------------------------------------------------------
create type verification_state as enum (
  'unverified',          -- collected, not yet checked
  'owner_submitted',     -- supplied by the verified winery owner
  'third_party_sourced', -- taken from a cited third-party source
  'editor_verified',     -- checked by an editor against a primary source
  'officially_verified'  -- matched against an official registry / regulation / results list
);
create type user_role as enum ('visitor', 'owner', 'editor', 'admin');
create type publish_status as enum ('draft', 'published', 'archived');
create type wine_type as enum ('red', 'white', 'rose', 'sparkling', 'dessert', 'orange', 'fortified', 'other');
create type location_kind as enum ('winery', 'tasting_room', 'shop', 'vineyard', 'office');
create type coordinate_precision as enum ('exact', 'address', 'settlement', 'approximate');
create type inquiry_status as enum ('new', 'seen', 'replied', 'accepted', 'declined', 'closed', 'spam');
create type claim_status as enum ('pending', 'needs_info', 'approved', 'rejected');
create type email_status as enum ('queued', 'sent', 'failed', 'no_provider');
create type change_status as enum ('pending', 'approved', 'rejected');

-- ---------------------------------------------------------------------------
-- Provenance
-- ---------------------------------------------------------------------------
create table data_sources (
  id            serial primary key,
  name          text not null,
  url           text,
  kind          text not null check (kind in (
                  'official_regulation','official_registry','winery_website','press',
                  'competition_results','owner_submission','editorial_research','tourism_board',
                  'directory','other')),
  publisher     text,
  license_note  text,
  accessed_at   date,
  notes         text,
  created_at    timestamptz not null default now(),
  unique (name, url)
);

-- ---------------------------------------------------------------------------
-- Users & sessions (declared early: referenced by many tables)
-- ---------------------------------------------------------------------------
create table users (
  id                uuid primary key default gen_random_uuid(),
  email             text not null,
  password_hash     text not null,
  name              text,
  role              user_role not null default 'visitor',
  locale            text not null default 'hr' check (locale in ('hr','en')),
  email_verified_at timestamptz,
  disabled_at       timestamptz,
  last_login_at     timestamptz,
  created_at        timestamptz not null default now()
);
create unique index users_email_lower on users (lower(email));

create table sessions (
  id          bigserial primary key,
  user_id     uuid not null references users(id) on delete cascade,
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  ip_hash     text,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index sessions_user on sessions(user_id);

-- ---------------------------------------------------------------------------
-- Official viticultural geography
--   region -> subregion -> district (vinogorje) -> vineyard site (položaj)
-- Protected designations (appellations) are modelled separately.
-- Geometry columns stay NULL until authoritative boundaries are imported.
-- ---------------------------------------------------------------------------
create table wine_regions (
  id            serial primary key,
  slug          text not null unique,
  official_name text not null,
  name          jsonb not null,            -- {"hr": "...", "en": "..."}
  content       jsonb not null default '{}'::jsonb,  -- per-locale long-form fields
  color         text not null default '#193C34',
  sort          int not null default 0,
  geom          geometry(MultiPolygon, 4326),
  geom_source_id int references data_sources(id),
  source_id     int references data_sources(id),
  verification  verification_state not null default 'unverified',
  updated_at    timestamptz not null default now()
);

create table wine_subregions (
  id            serial primary key,
  region_id     int not null references wine_regions(id) on delete restrict,
  slug          text not null unique,
  official_name text not null,
  name          jsonb not null,
  content       jsonb not null default '{}'::jsonb,
  sort          int not null default 0,
  geom          geometry(MultiPolygon, 4326),
  geom_source_id int references data_sources(id),
  source_id     int references data_sources(id),
  verification  verification_state not null default 'unverified',
  updated_at    timestamptz not null default now()
);

create table wine_districts (
  id            serial primary key,
  subregion_id  int not null references wine_subregions(id) on delete restrict,
  slug          text not null unique,
  official_name text not null,
  name          jsonb not null,
  content       jsonb not null default '{}'::jsonb,
  geom          geometry(MultiPolygon, 4326),
  geom_source_id int references data_sources(id),
  source_id     int references data_sources(id),
  verification  verification_state not null default 'unverified',
  updated_at    timestamptz not null default now()
);

create table vineyard_sites (
  id            serial primary key,
  district_id   int references wine_districts(id) on delete set null,
  slug          text not null unique,
  official_name text not null,
  name          jsonb not null,
  content       jsonb not null default '{}'::jsonb,
  geom          geometry(MultiPolygon, 4326),
  source_id     int references data_sources(id),
  verification  verification_state not null default 'unverified',
  updated_at    timestamptz not null default now()
);

create table appellations (
  id            serial primary key,
  slug          text not null unique,
  official_name text not null,
  name          jsonb not null,
  kind          text not null check (kind in ('pdo','pgi','traditional','other')),
  region_id     int references wine_regions(id),
  district_id   int references wine_districts(id),
  vineyard_site_id int references vineyard_sites(id),
  content       jsonb not null default '{}'::jsonb,
  geom          geometry(MultiPolygon, 4326),
  source_id     int references data_sources(id),
  verification  verification_state not null default 'unverified',
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Grape varieties
-- ---------------------------------------------------------------------------
create table grape_varieties (
  id              serial primary key,
  slug            text not null unique,
  name_hr         text not null,
  name_en         text not null,
  synonyms        text[] not null default '{}',
  berry_color     text not null check (berry_color in ('white','red','grey')),
  origin          text not null check (origin in ('indigenous','regional','international')),
  vivc_number     int,
  parentage       text,
  content         jsonb not null default '{}'::jsonb,
  acidity         smallint check (acidity between 1 and 5),
  tannin          smallint check (tannin between 1 and 5),
  is_featured     boolean not null default false,
  source_id       int references data_sources(id),
  verification    verification_state not null default 'unverified',
  search_norm     text not null default '',
  updated_at      timestamptz not null default now()
);
create index grape_search_trgm on grape_varieties using gin (search_norm gin_trgm_ops);

create table grape_regions (
  grape_id   int not null references grape_varieties(id) on delete cascade,
  region_id  int not null references wine_regions(id) on delete cascade,
  primary key (grape_id, region_id)
);

-- ---------------------------------------------------------------------------
-- Wineries
-- ---------------------------------------------------------------------------
create table media (
  id              bigserial primary key,
  winery_id       int,
  entity_type     text,
  entity_id       text,
  kind            text not null check (kind in ('logo','hero','gallery','tasting_room','historic','bottle','tech_sheet','region','article','claim_evidence')),
  storage_path    text not null,
  mime            text not null,
  bytes           int not null,
  width           int,
  height          int,
  alt             jsonb not null default '{}'::jsonb,
  caption         jsonb not null default '{}'::jsonb,
  credit          text,
  license         text not null check (license in ('owner_provided','cc0','cc_by','cc_by_sa','editorial_licensed','permission_granted','private')),
  license_url     text,
  rights_confirmed_at timestamptz,
  status          text not null default 'pending' check (status in ('pending','approved','rejected')),
  sort            int not null default 0,
  uploaded_by     uuid references users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create table wineries (
  id              serial primary key,
  slug            text not null unique,
  name            text not null,
  legal_name      text,
  alt_names       text[] not null default '{}',
  status          publish_status not null default 'draft',
  size_category   text check (size_category in ('boutique','family','medium','large','cooperative')),
  family_run      boolean,
  estate_grown    boolean,
  founded_year    int check (founded_year between 1000 and 2100),
  founder         text,
  owner_name      text,
  winemaker_name  text,
  generation      int,
  content         jsonb not null default '{}'::jsonb,  -- {hr:{short,description,story,philosophy,winemaker_bio,status}, en:{...}}
  website         text,
  email           text,
  phone           text,
  whatsapp        text,
  instagram       text,
  facebook        text,
  youtube         text,
  opening_hours   jsonb,           -- {"note": {...}} or structured weekly hours
  appointment_only boolean,
  languages       text[] not null default '{}',  -- languages spoken for visits (ISO 639-1)
  region_id       int references wine_regions(id),
  subregion_id    int references wine_subregions(id),
  district_id     int references wine_districts(id),
  island          text,
  is_featured     boolean not null default false,
  is_sponsored    boolean not null default false,
  featured_rank   int,
  logo_media_id   bigint references media(id) on delete set null,
  hero_media_id   bigint references media(id) on delete set null,
  verification    verification_state not null default 'unverified',
  verified_at     timestamptz,
  search_norm     text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index wineries_region on wineries(region_id);
create index wineries_subregion on wineries(subregion_id);
create index wineries_district on wineries(district_id);
create index wineries_status on wineries(status);
create index wineries_search_trgm on wineries using gin (search_norm gin_trgm_ops);
create index wineries_name_trgm on wineries using gin (atlas_norm(name) gin_trgm_ops);

alter table media add constraint media_winery_fk foreign key (winery_id) references wineries(id) on delete cascade;

-- Many producers have separate cellar / tasting room / vineyard addresses.
create table winery_locations (
  id            serial primary key,
  winery_id     int not null references wineries(id) on delete cascade,
  kind          location_kind not null default 'winery',
  label         jsonb not null default '{}'::jsonb,
  address       text,
  postal_code   text,
  town          text,
  municipality  text,
  county        text,
  geom          geography(Point, 4326),
  precision     coordinate_precision not null default 'approximate',
  is_primary    boolean not null default false,
  geocode_source text,
  source_id     int references data_sources(id),
  verification  verification_state not null default 'unverified',
  verified_at   timestamptz
);
create index winery_locations_geom on winery_locations using gist (geom);
create index winery_locations_winery on winery_locations(winery_id);
create unique index winery_locations_one_primary on winery_locations(winery_id) where is_primary;

-- Statistics always carry a source, reference year and verification state.
create table winery_stats (
  id              serial primary key,
  winery_id       int not null references wineries(id) on delete cascade,
  metric          text not null check (metric in (
                    'vineyard_area_ha','vine_count','parcel_count','annual_bottles',
                    'annual_grapes_tonnes','altitude_min_m','altitude_max_m',
                    'planting_density_per_ha','average_vine_age_years')),
  value           numeric not null,
  reference_year  int,
  source_id       int references data_sources(id),
  verification    verification_state not null default 'unverified',
  verified_at     timestamptz,
  notes           text,
  unique (winery_id, metric, reference_year)
);

create table winery_facilities (
  winery_id     int not null references wineries(id) on delete cascade,
  facility      text not null check (facility in (
                  'tasting','guided_tour','vineyard_walk','food_pairing','restaurant',
                  'accommodation','family_friendly','pet_friendly','wheelchair_accessible',
                  'parking','groups','by_appointment','shop','harvest_experience')),
  source_id     int references data_sources(id),
  verification  verification_state not null default 'unverified',
  primary key (winery_id, facility)
);

create table winery_certifications (
  id            serial primary key,
  winery_id     int not null references wineries(id) on delete cascade,
  kind          text not null check (kind in ('organic','biodynamic','sustainable','vegan')),
  certifier     text,
  certificate_ref text,
  valid_until   date,
  source_id     int references data_sources(id),
  verification  verification_state not null default 'unverified',
  verified_at   timestamptz
);

create table vineyards (
  id              serial primary key,
  winery_id       int not null references wineries(id) on delete cascade,
  name            text not null,
  district_id     int references wine_districts(id),
  vineyard_site_id int references vineyard_sites(id),
  area_ha         numeric,
  altitude_m      int,
  aspect          text,
  soil            jsonb not null default '{}'::jsonb,
  climate         jsonb not null default '{}'::jsonb,
  training_system text,
  planting_density_per_ha int,
  vine_age_years  int,
  irrigation      boolean,
  geom            geography(Point, 4326),
  source_id       int references data_sources(id),
  verification    verification_state not null default 'unverified',
  reference_year  int
);

create table winery_grape_varieties (
  winery_id     int not null references wineries(id) on delete cascade,
  grape_id      int not null references grape_varieties(id) on delete cascade,
  relation      text not null default 'grown' check (relation in ('grown','purchased','both','unknown')),
  is_signature  boolean not null default false,
  source_id     int references data_sources(id),
  verification  verification_state not null default 'unverified',
  primary key (winery_id, grape_id)
);
create index wgv_grape on winery_grape_varieties(grape_id);

create table vineyard_grape_varieties (
  vineyard_id   int not null references vineyards(id) on delete cascade,
  grape_id      int not null references grape_varieties(id) on delete cascade,
  area_ha       numeric,
  primary key (vineyard_id, grape_id)
);

-- ---------------------------------------------------------------------------
-- Wines
-- ---------------------------------------------------------------------------
create table wines (
  id              serial primary key,
  winery_id       int not null references wineries(id) on delete cascade,
  slug            text not null unique,
  name            text not null,
  type            wine_type not null,
  styles          text[] not null default '{}',   -- dry, off_dry, sweet, barrique, amphora, skin_contact, traditional_method, pet_nat, predicate...
  appellation_id  int references appellations(id),
  vineyard_site_id int references vineyard_sites(id),
  content         jsonb not null default '{}'::jsonb, -- {hr:{description,tasting_notes,aroma,vinification,pairing}, en:{...}}
  serving_temp    text,
  aging_potential text,
  bottle_formats  text[] not null default '{}',
  purchase_url    text,
  bottle_media_id bigint references media(id) on delete set null,
  status          publish_status not null default 'published',
  source_id       int references data_sources(id),
  verification    verification_state not null default 'unverified',
  search_norm     text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index wines_winery on wines(winery_id);
create index wines_search_trgm on wines using gin (search_norm gin_trgm_ops);

create table wine_vintages (
  id                serial primary key,
  wine_id           int not null references wines(id) on delete cascade,
  year              int check (year between 1900 and 2100),  -- NULL = non-vintage
  alcohol_pct       numeric(4,2),
  residual_sugar_gl numeric(6,2),
  total_acidity_gl  numeric(5,2),
  fermentation      jsonb not null default '{}'::jsonb,
  aging             jsonb not null default '{}'::jsonb,
  barrel            text,
  tech_sheet_media_id bigint references media(id) on delete set null,
  price_eur         numeric(8,2),
  price_source_id   int references data_sources(id),
  source_id         int references data_sources(id),
  verification      verification_state not null default 'unverified',
  unique (wine_id, year)
);

create table wine_grape_compositions (
  id          serial primary key,
  wine_id     int not null references wines(id) on delete cascade,
  vintage_id  int references wine_vintages(id) on delete cascade,
  grape_id    int not null references grape_varieties(id) on delete restrict,
  percentage  numeric(5,2) check (percentage > 0 and percentage <= 100)
);
create unique index wgc_unique on wine_grape_compositions(wine_id, coalesce(vintage_id, 0), grape_id);
create index wgc_grape on wine_grape_compositions(grape_id);

-- ---------------------------------------------------------------------------
-- Competitions & awards
-- ---------------------------------------------------------------------------
create table competitions (
  id          serial primary key,
  slug        text not null unique,
  name        text not null,
  short_name  text,
  organizer   text,
  country     text,
  website     text,
  scope       text not null default 'international' check (scope in ('international','national','regional')),
  sort        int not null default 0
);

create table wine_awards (
  id              serial primary key,
  competition_id  int not null references competitions(id),
  year            int not null check (year between 1950 and 2100),
  winery_id       int not null references wineries(id) on delete cascade,
  wine_id         int not null references wines(id) on delete cascade,
  vintage_id      int references wine_vintages(id) on delete set null,
  vintage_year    int,
  medal           text not null check (medal in ('best_in_show','platinum','trophy','gold','silver','bronze','commended','grand_gold','other')),
  medal_label     text,
  score           numeric(5,2),
  category        text,
  source_url      text,
  source_id       int references data_sources(id),
  verification    verification_state not null default 'unverified',
  verified_at     timestamptz,
  verified_by     uuid references users(id) on delete set null,
  notes           text,
  created_at      timestamptz not null default now()
);
create index wine_awards_wine on wine_awards(wine_id);
create index wine_awards_winery on wine_awards(winery_id);

-- An award must belong to the winery that produces the wine.
create or replace function wine_awards_check_winery() returns trigger language plpgsql as $$
begin
  if (select winery_id from wines where id = new.wine_id) is distinct from new.winery_id then
    raise exception 'wine_awards.winery_id must match the winery of wine %', new.wine_id;
  end if;
  if new.vintage_id is not null and
     (select wine_id from wine_vintages where id = new.vintage_id) is distinct from new.wine_id then
    raise exception 'wine_awards.vintage_id must belong to wine %', new.wine_id;
  end if;
  return new;
end $$;
create trigger wine_awards_check before insert or update on wine_awards
  for each row execute function wine_awards_check_winery();

-- ---------------------------------------------------------------------------
-- Visiting: experiences & inquiries
-- ---------------------------------------------------------------------------
create table tasting_experiences (
  id                  serial primary key,
  winery_id           int not null references wineries(id) on delete cascade,
  kind                text not null check (kind in ('tasting','cellar_tour','vineyard_walk','food_pairing','harvest','accommodation','workshop','other')),
  name                jsonb not null,
  description         jsonb not null default '{}'::jsonb,
  wines_included      int,
  duration_min        int,
  price_eur           numeric(8,2),
  price_note          jsonb not null default '{}'::jsonb,
  food_included       boolean,
  min_group           int,
  max_group           int,
  languages           text[] not null default '{}',
  appointment_required boolean,
  accessibility       jsonb not null default '{}'::jsonb,
  is_active           boolean not null default true,
  sort                int not null default 0,
  source_id           int references data_sources(id),
  verification        verification_state not null default 'unverified',
  updated_at          timestamptz not null default now()
);
create index tasting_experiences_winery on tasting_experiences(winery_id);

create table tasting_inquiries (
  id                  uuid primary key default gen_random_uuid(),
  public_ref          text not null unique,
  winery_id           int not null references wineries(id) on delete cascade,
  experience_id       int references tasting_experiences(id) on delete set null,
  preferred_date      date,
  preferred_time      text,
  flexible_schedule   boolean not null default false,
  adults              int not null check (adults between 1 and 200),
  children            int not null default 0 check (children between 0 and 100),
  language            text,
  full_name           text not null,
  email               text not null,
  phone               text,
  country             text,
  message             text,
  locale              text not null default 'hr',
  consent_privacy_at  timestamptz not null,
  consent_marketing   boolean not null default false,
  status              inquiry_status not null default 'new',
  idempotency_key     text not null unique,
  ip_hash             text,
  owner_reply         text,
  replied_at          timestamptz,
  retention_until     date not null default (current_date + interval '24 months'),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index tasting_inquiries_winery on tasting_inquiries(winery_id, created_at desc);
create index tasting_inquiries_email on tasting_inquiries(lower(email), winery_id, created_at desc);

create table inquiry_events (
  id            bigserial primary key,
  inquiry_id    uuid not null references tasting_inquiries(id) on delete cascade,
  actor_user_id uuid references users(id) on delete set null,
  kind          text not null,
  data          jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create table email_outbox (
  id              bigserial primary key,
  to_email        text not null,
  subject         text not null,
  text_body       text not null,
  html_body       text,
  kind            text not null,
  inquiry_id      uuid references tasting_inquiries(id) on delete cascade,
  status          email_status not null default 'queued',
  provider        text,
  provider_id     text,
  error           text,
  attempts        int not null default 0,
  created_at      timestamptz not null default now(),
  sent_at         timestamptz
);
create index email_outbox_status on email_outbox(status, created_at);

-- ---------------------------------------------------------------------------
-- Ownership, moderation, reports
-- ---------------------------------------------------------------------------
create table winery_owners (
  winery_id   int not null references wineries(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  role        text not null default 'owner' check (role in ('owner','manager')),
  granted_by  uuid references users(id) on delete set null,
  created_at  timestamptz not null default now(),
  primary key (winery_id, user_id)
);

create table ownership_claims (
  id              uuid primary key default gen_random_uuid(),
  winery_id       int references wineries(id) on delete cascade,
  proposed_winery_name text,             -- for "list your winery" when no record exists
  user_id         uuid references users(id) on delete set null,
  claimant_name   text not null,
  claimant_email  text not null,
  claimant_phone  text,
  position        text,
  evidence        text not null,
  evidence_media_id bigint references media(id) on delete set null,
  status          claim_status not null default 'pending',
  reviewer_id     uuid references users(id) on delete set null,
  reviewer_notes  text,
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now()
);

create table change_requests (
  id            uuid primary key default gen_random_uuid(),
  winery_id     int not null references wineries(id) on delete cascade,
  submitted_by  uuid references users(id) on delete set null,
  entity_type   text not null default 'winery',
  entity_id     text,
  payload       jsonb not null,
  previous      jsonb,
  status        change_status not null default 'pending',
  reviewer_id   uuid references users(id) on delete set null,
  reviewer_notes text,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

create table data_reports (
  id            bigserial primary key,
  winery_id     int references wineries(id) on delete cascade,
  entity_type   text not null default 'winery',
  entity_id     text,
  field         text,
  message       text not null,
  reporter_email text,
  status        text not null default 'open' check (status in ('open','resolved','dismissed')),
  resolved_by   uuid references users(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Visitor features
-- ---------------------------------------------------------------------------
create table favorites (
  user_id     uuid not null references users(id) on delete cascade,
  entity_type text not null check (entity_type in ('winery','wine','grape')),
  entity_id   int not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, entity_type, entity_id)
);

create table winery_visits (
  id          bigserial primary key,
  user_id     uuid not null references users(id) on delete cascade,
  winery_id   int not null references wineries(id) on delete cascade,
  visited_on  date,
  notes       text,
  created_at  timestamptz not null default now(),
  unique (user_id, winery_id)
);

create table wine_routes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete cascade,
  slug        text unique,
  title       jsonb not null,
  description jsonb not null default '{}'::jsonb,
  is_editorial boolean not null default false,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table wine_route_stops (
  id          serial primary key,
  route_id    uuid not null references wine_routes(id) on delete cascade,
  winery_id   int not null references wineries(id) on delete cascade,
  position    int not null,
  day         int not null default 1,
  notes       jsonb not null default '{}'::jsonb
);
create index wine_route_stops_route on wine_route_stops(route_id, position);

-- ---------------------------------------------------------------------------
-- Editorial
-- ---------------------------------------------------------------------------
create table editorial_articles (
  id            serial primary key,
  slug          text not null unique,
  category      text not null check (category in ('regions','grapes','winemakers','education','travel','experiences','awards','heritage','history','gastronomy','methodology')),
  status        publish_status not null default 'draft',
  content       jsonb not null,     -- {hr:{title,excerpt,body,status}, en:{...}}; body is Markdown subset
  hero_media_id bigint references media(id) on delete set null,
  author_name   text,
  sources       jsonb not null default '[]'::jsonb,
  related       jsonb not null default '{}'::jsonb,  -- {wineries:[slug], grapes:[slug], regions:[slug]}
  reviewed_by   text,
  reviewed_at   timestamptz,
  published_at  timestamptz,
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Data operations
-- ---------------------------------------------------------------------------
create table data_verifications (
  id            bigserial primary key,
  entity_type   text not null,
  entity_id     text not null,
  field         text,
  state         verification_state not null,
  method        text not null check (method in ('website_check','official_registry','official_regulation','owner_document','phone_call','site_visit','competition_results','press','other')),
  source_id     int references data_sources(id),
  verified_by   uuid references users(id) on delete set null,
  notes         text,
  verified_at   timestamptz not null default now()
);
create index data_verifications_entity on data_verifications(entity_type, entity_id);

create table data_import_jobs (
  id            bigserial primary key,
  kind          text not null,
  filename      text,
  dry_run       boolean not null default true,
  status        text not null default 'running' check (status in ('running','completed','failed')),
  total_rows    int not null default 0,
  created_rows  int not null default 0,
  updated_rows  int not null default 0,
  skipped_rows  int not null default 0,
  report        jsonb not null default '[]'::jsonb,
  created_by    uuid references users(id) on delete set null,
  created_at    timestamptz not null default now(),
  finished_at   timestamptz
);

create table audit_log (
  id            bigserial primary key,
  actor_user_id uuid references users(id) on delete set null,
  action        text not null,
  entity_type   text not null,
  entity_id     text,
  diff          jsonb,
  created_at    timestamptz not null default now()
);
create index audit_log_entity on audit_log(entity_type, entity_id, created_at desc);
create index audit_log_created on audit_log(created_at desc);

create table rate_limit_events (
  key         text not null,
  created_at  timestamptz not null default now()
);
create index rate_limit_events_key on rate_limit_events(key, created_at desc);

-- ---------------------------------------------------------------------------
-- Search document maintenance
-- ---------------------------------------------------------------------------
create or replace function refresh_winery_search(p_id int) returns void language sql as $$
  update wineries w set search_norm = atlas_norm(concat_ws(' ',
      w.name, w.legal_name, array_to_string(w.alt_names, ' '),
      w.founder, w.owner_name, w.winemaker_name, w.island,
      (select string_agg(concat_ws(' ', l.town, l.municipality, l.county, l.address), ' ')
         from winery_locations l where l.winery_id = w.id),
      (select concat_ws(' ', r.official_name, r.name->>'hr', r.name->>'en') from wine_regions r where r.id = w.region_id),
      (select concat_ws(' ', s.official_name, s.name->>'hr', s.name->>'en') from wine_subregions s where s.id = w.subregion_id),
      (select concat_ws(' ', d.official_name, d.name->>'hr', d.name->>'en') from wine_districts d where d.id = w.district_id),
      (select string_agg(concat_ws(' ', g.name_hr, g.name_en, array_to_string(g.synonyms, ' ')), ' ')
         from winery_grape_varieties wg join grape_varieties g on g.id = wg.grape_id where wg.winery_id = w.id),
      (select string_agg(concat_ws(' ', wi.name, a.official_name, vs.official_name), ' ')
         from wines wi left join appellations a on a.id = wi.appellation_id
         left join vineyard_sites vs on vs.id = wi.vineyard_site_id
         where wi.winery_id = w.id and wi.status = 'published'),
      (select string_agg(distinct concat_ws(' ', g.name_hr, g.name_en), ' ')
         from wines wi join wine_grape_compositions c on c.wine_id = wi.id
         join grape_varieties g on g.id = c.grape_id where wi.winery_id = w.id),
      (select string_agg(distinct concat_ws(' ', c.name, c.short_name), ' ')
         from wine_awards aw join competitions c on c.id = aw.competition_id
         where aw.winery_id = w.id and aw.verification in ('editor_verified','officially_verified'))
    )), updated_at = w.updated_at
  where w.id = p_id;

  update wines wi set search_norm = atlas_norm(concat_ws(' ',
      wi.name,
      (select w.name from wineries w where w.id = wi.winery_id),
      (select a.official_name from appellations a where a.id = wi.appellation_id),
      (select vs.official_name from vineyard_sites vs where vs.id = wi.vineyard_site_id),
      (select string_agg(concat_ws(' ', g.name_hr, g.name_en, array_to_string(g.synonyms,' ')), ' ')
         from wine_grape_compositions c join grape_varieties g on g.id = c.grape_id where c.wine_id = wi.id)))
  where wi.winery_id = p_id;
$$;

create or replace function refresh_grape_search(p_id int) returns void language sql as $$
  update grape_varieties g
     set search_norm = atlas_norm(concat_ws(' ', g.name_hr, g.name_en, array_to_string(g.synonyms, ' ')))
   where g.id = p_id;
$$;

