import "./env";
import postgres from "postgres";
import { SOURCES, REGIONS, SUBREGIONS, DISTRICTS, VINEYARD_SITES } from "../db/seed/geography";
import { GRAPES } from "../db/seed/grapes";
import { WINERIES, THIRD_PARTY } from "../db/seed/wineries";
import { COMPETITIONS, ROUTES, ARTICLES } from "../db/seed/editorial";
import { slugify } from "../src/lib/norm";
import { hashPassword } from "../src/lib/password";

const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
const demoUsers = process.argv.includes("--demo-users") || process.env.SEED_DEMO_USERS === "true";

async function source(s: { name: string; url?: string; kind: string; publisher?: string; notes?: string }) {
  if (!s.url) {
    const [existing] = await sql`select id from data_sources where name = ${s.name} and url is null`;
    if (existing) return existing.id as number;
  }
  const [row] = await sql`
    insert into data_sources (name, url, kind, publisher, notes)
    values (${s.name}, ${s.url ?? null}, ${s.kind}, ${s.publisher ?? null}, ${s.notes ?? null})
    on conflict (name, url) do update set kind = excluded.kind, notes = excluded.notes
    returning id`;
  return row.id as number;
}

async function main() {
  console.log("Seeding Croatian Wine Atlas …");
  const nn2022 = await source(SOURCES.nn2022);
  const nn2019 = await source(SOURCES.nn2019);
  await source(SOURCES.nn2019b);
  const editorial = await source({
    name: "Croatian Wine Atlas editorial research (October 2026)", kind: "editorial_research",
    notes: "Compiled from widely published information. Links and facts not yet re-checked by an editor against primary sources.",
  });
  const third: Record<string, number> = {};
  for (const [k, v] of Object.entries(THIRD_PARTY)) third[k] = await source(v);

  // ── Geography ──
  const regionId: Record<string, number> = {};
  for (const r of REGIONS) {
    const content = { en: { ...r.content.en, status: "draft" }, hr: { ...r.content.hr, status: "draft" } };
    const [row] = await sql`
      insert into wine_regions (slug, official_name, name, content, color, sort, source_id, verification)
      values (${r.slug}, ${r.official}, ${sql.json(r.name)}, ${sql.json(content)}, ${r.color}, ${r.sort}, ${nn2022}, 'third_party_sourced')
      on conflict (slug) do update set official_name = excluded.official_name, name = excluded.name,
        content = excluded.content, color = excluded.color, sort = excluded.sort, source_id = excluded.source_id, verification = excluded.verification
      returning id`;
    regionId[r.slug] = row.id;
  }
  const subId: Record<string, number> = {};
  for (const s of SUBREGIONS) {
    const [row] = await sql`
      insert into wine_subregions (region_id, slug, official_name, name, sort, source_id, verification)
      values (${regionId[s.region]}, ${s.slug}, ${s.official}, ${sql.json(s.name)}, ${s.sort}, ${nn2022}, 'third_party_sourced')
      on conflict (slug) do update set official_name = excluded.official_name, name = excluded.name, region_id = excluded.region_id,
        source_id = excluded.source_id, verification = excluded.verification
      returning id`;
    subId[s.slug] = row.id;
  }
  const distId: Record<string, number> = {};
  for (const d of DISTRICTS) {
    const content = {
      en: { note: "District name to be confirmed against the annex of NN 81/2022.", status: "draft" },
      hr: { note: "Naziv vinogorja potrebno je potvrditi prema prilogu NN 81/2022.", status: "draft" },
    };
    const [row] = await sql`
      insert into wine_districts (subregion_id, slug, official_name, name, content, source_id, verification)
      values (${subId[d.subregion]}, ${d.slug}, ${d.official}, ${sql.json(d.name)}, ${sql.json(content)},
              ${d.confirmed ? nn2019 : nn2022}, ${d.confirmed ? "third_party_sourced" : "unverified"})
      on conflict (slug) do update set official_name = excluded.official_name, name = excluded.name
      returning id`;
    distId[d.slug] = row.id;
  }
  const siteId: Record<string, number> = {};
  for (const v of VINEYARD_SITES) {
    const content = { en: { ...v.content.en, status: "draft" }, hr: { ...v.content.hr, status: "draft" } };
    const [row] = await sql`
      insert into vineyard_sites (district_id, slug, official_name, name, content, source_id, verification)
      values (${distId[v.district]}, ${v.slug}, ${v.official}, ${sql.json(v.name)}, ${sql.json(content)}, ${editorial}, 'unverified')
      on conflict (slug) do update set name = excluded.name, content = excluded.content
      returning id`;
    siteId[v.slug] = row.id;
  }

  // ── Grapes ──
  const grapeId: Record<string, number> = {};
  for (const g of GRAPES) {
    const content = { en: { ...g.en_t, status: "draft" }, hr: { ...g.hr_t, status: "draft" } };
    const [row] = await sql`
      insert into grape_varieties (slug, name_hr, name_en, synonyms, berry_color, origin, parentage, content, acidity, tannin, is_featured, source_id, verification)
      values (${g.slug}, ${g.hr}, ${g.en}, ${g.synonyms ?? []}, ${g.color}, ${g.origin}, ${g.parentage ?? null},
              ${sql.json(content)}, ${g.acidity ?? null}, ${g.tannin ?? null}, ${g.featured ?? false}, ${editorial}, 'unverified')
      on conflict (slug) do update set name_hr = excluded.name_hr, name_en = excluded.name_en, synonyms = excluded.synonyms,
        berry_color = excluded.berry_color, origin = excluded.origin, parentage = excluded.parentage, content = excluded.content,
        acidity = excluded.acidity, tannin = excluded.tannin, is_featured = excluded.is_featured
      returning id`;
    grapeId[g.slug] = row.id;
    await sql`select refresh_grape_search(${row.id})`;
    await sql`delete from grape_regions where grape_id = ${row.id}`;
    for (const r of g.regions) await sql`insert into grape_regions values (${row.id}, ${regionId[r]}) on conflict do nothing`;
  }

  // ── Competitions ──
  for (const c of COMPETITIONS) {
    await sql`insert into competitions (slug, name, short_name, organizer, country, website, scope, sort)
      values (${c.slug}, ${c.name}, ${c.short}, ${c.organizer}, ${c.country}, ${c.website}, ${c.scope}, ${c.sort})
      on conflict (slug) do update set name = excluded.name, short_name = excluded.short_name, website = excluded.website`;
  }

  // ── Wineries ──
  const wineryId: Record<string, number> = {};
  for (const w of WINERIES) {
    const websiteSource = w.website
      ? await source({ name: `${w.name} — official website`, url: w.website, kind: "winery_website", notes: "Domain recorded from editorial research; not yet re-checked live." })
      : null;
    const baseSource = w.sources?.length ? third[w.sources[0]] : websiteSource ?? editorial;
    const verification = w.sources?.length ? "third_party_sourced" : "unverified";
    const content = { en: { short: w.en, status: "draft" }, hr: { short: w.hr, status: "draft" } };
    const [row] = await sql`
      insert into wineries (slug, name, alt_names, status, size_category, family_run, founded_year, founder, owner_name, winemaker_name,
        content, website, region_id, subregion_id, district_id, island, is_featured, featured_rank, verification)
      values (${w.slug}, ${w.name}, ${w.alt ?? []}, 'published', ${w.size ?? null}, ${w.family ?? null}, ${w.founded ?? null},
        ${w.founder ?? null}, ${w.owner ?? null}, ${w.winemaker ?? null}, ${sql.json(content)}, ${w.website ?? null},
        ${regionId[w.region]}, ${subId[w.subregion]}, ${w.district ? distId[w.district] : null}, ${w.island ?? null},
        ${w.featured != null}, ${w.featured ?? null}, ${verification})
      on conflict (slug) do update set name = excluded.name, alt_names = excluded.alt_names, size_category = excluded.size_category,
        family_run = excluded.family_run, founded_year = excluded.founded_year, founder = excluded.founder, owner_name = excluded.owner_name,
        winemaker_name = excluded.winemaker_name, website = excluded.website, region_id = excluded.region_id,
        subregion_id = excluded.subregion_id, district_id = excluded.district_id, island = excluded.island,
        is_featured = excluded.is_featured, featured_rank = excluded.featured_rank,
        content = case when wineries.content->'en'->>'status' = 'draft' then excluded.content else wineries.content end
      returning id`;
    const id = row.id as number;
    wineryId[w.slug] = id;

    // Never overwrite locations that an editor or an import has taken over.
    const edited = await sql`select 1 from winery_locations where winery_id = ${id} and geocode_source <> 'seed'`;
    if (!edited.length) await sql`delete from winery_locations where winery_id = ${id} and geocode_source = 'seed'`;
    for (const [i, l] of edited.length ? [] : w.locations.entries()) {
      await sql`insert into winery_locations (winery_id, kind, label, address, postal_code, town, municipality, county, geom, precision,
          is_primary, geocode_source, source_id, verification)
        values (${id}, ${l.kind ?? "winery"}, ${sql.json(l.label ?? {})}, ${l.address ?? null}, ${l.postal ?? null}, ${l.town},
          ${l.municipality ?? null}, ${l.county}, ST_SetSRID(ST_MakePoint(${l.lng}, ${l.lat}), 4326)::geography, ${l.precision},
          ${l.primary ?? i === 0}, 'seed', ${l.source ? third[l.source] : baseSource}, ${l.source ? "third_party_sourced" : "unverified"})`;
    }
    await sql`delete from winery_grape_varieties where winery_id = ${id}`;
    for (const g of w.grapes) {
      await sql`insert into winery_grape_varieties (winery_id, grape_id, relation, is_signature, source_id, verification)
        values (${id}, ${grapeId[g.slug]}, 'unknown', ${g.signature ?? false}, ${baseSource}, 'unverified')`;
    }
    for (const f of w.facilities ?? []) {
      await sql`insert into winery_facilities (winery_id, facility, source_id, verification)
        values (${id}, ${f.facility}, ${third[f.source]}, 'third_party_sourced')
        on conflict (winery_id, facility) do update set source_id = excluded.source_id`;
    }
    await sql`delete from tasting_experiences where winery_id = ${id} and verification = 'third_party_sourced' and price_eur is null`;
    for (const [i, e] of (w.experiences ?? []).entries()) {
      await sql`insert into tasting_experiences (winery_id, kind, name, sort, source_id, verification)
        values (${id}, ${e.kind}, ${sql.json(e.name)}, ${i}, ${third[e.source]}, 'third_party_sourced')`;
    }
    for (const wine of w.wines ?? []) {
      const slug = `${w.slug}-${slugify(wine.name)}`;
      const [wr] = await sql`
        insert into wines (winery_id, slug, name, type, styles, vineyard_site_id, source_id, verification)
        values (${id}, ${slug}, ${wine.name}, ${wine.type}, ${wine.styles ?? []}, ${wine.site ? siteId[wine.site] : null},
          ${wine.source ? third[wine.source] : baseSource}, ${wine.source ? "third_party_sourced" : "unverified"})
        on conflict (slug) do update set name = excluded.name, type = excluded.type, styles = excluded.styles,
          vineyard_site_id = excluded.vineyard_site_id
        returning id`;
      await sql`delete from wine_grape_compositions where wine_id = ${wr.id} and vintage_id is null`;
      for (const g of wine.grapes ?? []) {
        await sql`insert into wine_grape_compositions (wine_id, grape_id, percentage)
          values (${wr.id}, ${grapeId[g]}, ${wine.grapes!.length === 1 ? 100 : null})`;
      }
    }
    await sql`select refresh_winery_search(${id})`;
  }

  // ── Editorial routes ──
  for (const r of ROUTES) {
    const [row] = await sql`
      insert into wine_routes (slug, title, description, is_editorial, is_public)
      values (${r.slug}, ${sql.json(r.title)}, ${sql.json(r.description)}, true, true)
      on conflict (slug) do update set title = excluded.title, description = excluded.description
      returning id`;
    await sql`delete from wine_route_stops where route_id = ${row.id}`;
    for (const [i, s] of r.stops.entries()) {
      await sql`insert into wine_route_stops (route_id, winery_id, position) values (${row.id}, ${wineryId[s]}, ${i})`;
    }
  }

  // ── Articles ──
  for (const a of ARTICLES) {
    await sql`
      insert into editorial_articles (slug, category, status, content, author_name, sources, related, published_at)
      values (${a.slug}, ${a.category}, 'published', ${sql.json(a.content)}, ${a.author}, ${sql.json(a.sources)}, ${sql.json(a.related)}, now())
      on conflict (slug) do update set content = excluded.content, sources = excluded.sources, related = excluded.related`;
  }

  // ── Demo users (development & tests only) ──
  if (demoUsers) {
    const users = [
      { email: "admin@atlas.test", name: "Atlas Admin", role: "admin", password: "atlas-admin-dev" },
      { email: "editor@atlas.test", name: "Atlas Editor", role: "editor", password: "atlas-editor-dev" },
      { email: "owner@atlas.test", name: "Demo Owner", role: "owner", password: "atlas-owner-dev" },
      { email: "visitor@atlas.test", name: "Demo Visitor", role: "visitor", password: "atlas-visitor-dev" },
    ];
    for (const u of users) {
      const hash = await hashPassword(u.password);
      await sql`insert into users (email, name, role, password_hash, email_verified_at)
        values (${u.email}, ${u.name}, ${u.role}, ${hash}, now())
        on conflict (lower(email)) do update set role = excluded.role, password_hash = excluded.password_hash`;
    }
    // The demo owner manages one listing so the owner portal can be exercised locally.
    await sql`insert into winery_owners (winery_id, user_id, role)
      select ${wineryId["toreta"]}, id, 'owner' from users where email = 'owner@atlas.test'
      on conflict do nothing`;
    console.log("Demo users created (never use --demo-users in production).");
  }

  const [{ count }] = await sql`select count(*)::int from wineries where status = 'published'`;
  console.log(`Done. ${count} published wineries.`);
}

main().then(() => sql.end()).catch(async (e) => { console.error(e); await sql.end(); process.exit(1); });
