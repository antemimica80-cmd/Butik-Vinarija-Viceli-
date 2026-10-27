import { z } from "zod";
import type postgres from "postgres";
import { csvObjects } from "./csv";
import { slugify, norm } from "./norm";
import { SIZE_CATEGORIES, VERIFICATION_STATES } from "./constants";

/**
 * CSV winery import. Columns (header names, case-insensitive) — see docs/DATA_IMPORT.md:
 * name*, slug, region*, subregion, district, island, town*, municipality, county, address, postal_code,
 * lat, lng, precision, website, email, phone, founded_year, family_run, size_category,
 * grapes (slugs separated by ;), signature_grapes, short_hr, short_en, source_name*, source_url, verification, status
 *
 * Rules: rows are validated individually; an existing record is updated only when its slug matches
 * exactly. Possible duplicates (same normalised name, same website domain, or a similar name within
 * 2 km) are reported and skipped — never merged silently.
 */
const yesNo = z.enum(["", "yes", "no", "da", "ne", "true", "false"]).transform((v) => (v === "" ? null : ["yes", "da", "true"].includes(v)));
const optUrl = z.string().max(300).refine((u) => u === "" || /^https?:\/\/[^\s]+\.[^\s]+/.test(u), "url");

export const importRowSchema = z.object({
  name: z.string().min(2).max(160),
  slug: z.string().regex(/^[a-z0-9-]*$/).max(80),
  region: z.string().min(2).regex(/^[a-z0-9-]+$/),
  subregion: z.string().regex(/^[a-z0-9-]*$/),
  district: z.string().regex(/^[a-z0-9-]*$/),
  island: z.string().max(80),
  town: z.string().min(1).max(100),
  municipality: z.string().max(100),
  county: z.string().max(100),
  address: z.string().max(200),
  postal_code: z.string().max(12),
  lat: z.string().refine((v) => v === "" || (Number(v) >= 42 && Number(v) <= 47), "lat out of Croatia"),
  lng: z.string().refine((v) => v === "" || (Number(v) >= 13 && Number(v) <= 20), "lng out of Croatia"),
  precision: z.enum(["", "exact", "address", "settlement", "approximate"]),
  website: optUrl,
  email: z.string().max(200).refine((v) => v === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "email"),
  phone: z.string().max(40),
  founded_year: z.string().refine((v) => v === "" || (/^\d{4}$/.test(v) && Number(v) >= 1000 && Number(v) <= 2100), "year"),
  family_run: yesNo,
  size_category: z.enum(["", ...SIZE_CATEGORIES]),
  grapes: z.string().max(1000),
  signature_grapes: z.string().max(400),
  short_hr: z.string().max(400),
  short_en: z.string().max(400),
  source_name: z.string().min(3).max(200),
  source_url: optUrl,
  verification: z.enum(["", ...VERIFICATION_STATES]),
  status: z.enum(["", "draft", "published"]),
});

export type ImportRowReport = { row: number; action: "create" | "update" | "skip" | "error"; slug?: string; message?: string };

const domain = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

export async function importWineriesCsvWith(sql: postgres.Sql, text: string, opts: { dryRun: boolean; userId: string | null; filename?: string }) {
  const rows = csvObjects(text);
  const report: ImportRowReport[] = [];
  const [job] = await sql<{ id: number }[]>`insert into data_import_jobs (kind, filename, dry_run, total_rows, created_by)
    values ('wineries_csv', ${opts.filename ?? null}, ${opts.dryRun}, ${rows.length}, ${opts.userId}) returning id`;
  const regions = await sql<{ id: number; slug: string }[]>`select id, slug from wine_regions`;
  const subs = await sql<{ id: number; slug: string; region_id: number }[]>`select id, slug, region_id from wine_subregions`;
  const dists = await sql<{ id: number; slug: string; subregion_id: number }[]>`select id, slug, subregion_id from wine_districts`;
  const grapes = await sql<{ id: number; slug: string }[]>`select id, slug from grape_varieties`;
  const seenSlugs = new Set<string>();

  for (const [i, raw] of rows.entries()) {
    const rowNo = i + 2; // header is row 1
    const full = Object.fromEntries(Object.keys(importRowSchema.shape).map((k) => [k, raw[k] ?? ""]));
    const p = importRowSchema.safeParse(full);
    if (!p.success) { report.push({ row: rowNo, action: "error", message: p.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ") }); continue; }
    const d = p.data;
    const slug = d.slug || slugify(d.name);
    if (seenSlugs.has(slug)) { report.push({ row: rowNo, action: "error", slug, message: "duplicate slug within file" }); continue; }
    seenSlugs.add(slug);
    const region = regions.find((r) => r.slug === d.region);
    const sub = d.subregion ? subs.find((s) => s.slug === d.subregion) : undefined;
    const dist = d.district ? dists.find((s) => s.slug === d.district) : undefined;
    if (!region) { report.push({ row: rowNo, action: "error", slug, message: `unknown region ${d.region}` }); continue; }
    if (d.subregion && (!sub || sub.region_id !== region.id)) { report.push({ row: rowNo, action: "error", slug, message: `subregion ${d.subregion} not in region` }); continue; }
    if (d.district && (!dist || (sub && dist.subregion_id !== sub.id))) { report.push({ row: rowNo, action: "error", slug, message: `district ${d.district} not in subregion` }); continue; }
    const grapeSlugs = d.grapes.split(/[;|]/).map((s) => s.trim()).filter(Boolean);
    const unknownGrapes = grapeSlugs.filter((g) => !grapes.some((x) => x.slug === g));
    if (unknownGrapes.length) { report.push({ row: rowNo, action: "error", slug, message: `unknown grapes: ${unknownGrapes.join(", ")}` }); continue; }

    const [match] = await sql<{ id: number }[]>`select id from wineries where slug = ${slug}`;
    // Updates require the row to name the slug explicitly; a derived slug that collides is a possible duplicate.
    if (match && !d.slug) { report.push({ row: rowNo, action: "skip", slug, message: `possible duplicate of ${slug} (same name) — add the slug column to update it` }); continue; }
    const existing = match;
    if (!existing) {
      const lat = d.lat ? Number(d.lat) : null, lng = d.lng ? Number(d.lng) : null;
      const dupes = await sql<{ slug: string; reason: string }[]>`
        select w.slug, case
          when atlas_norm(w.name) = ${norm(d.name)} then 'same name'
          when ${domain(d.website)} <> '' and w.website ilike ${"%" + domain(d.website) + "%"} then 'same website'
          else 'similar name nearby' end as reason
        from wineries w left join winery_locations l on l.winery_id = w.id and l.is_primary
        where atlas_norm(w.name) = ${norm(d.name)}
          or (${domain(d.website)} <> '' and w.website ilike ${"%" + domain(d.website) + "%"})
          or (${lat}::float is not null and l.geom is not null and similarity(atlas_norm(w.name), ${norm(d.name)}) > 0.45
              and ST_DWithin(l.geom, ST_SetSRID(ST_MakePoint(${lng}::float, ${lat}::float), 4326)::geography, 2000))
        limit 3`;
      if (dupes.length) { report.push({ row: rowNo, action: "skip", slug, message: `possible duplicate of ${dupes.map((x) => `${x.slug} (${x.reason})`).join(", ")}` }); continue; }
    }
    report.push({ row: rowNo, action: existing ? "update" : "create", slug });
    if (opts.dryRun) continue;

    await sql.begin(async (tx) => {
      const [src] = await tx<{ id: number }[]>`insert into data_sources (name, url, kind, notes)
        values (${d.source_name}, ${d.source_url || null}, 'other', ${`Imported via CSV job #${job.id}`})
        on conflict (name, url) do update set notes = excluded.notes returning id`;
      const content = { hr: d.short_hr ? { short: d.short_hr, status: "draft" } : {}, en: d.short_en ? { short: d.short_en, status: "draft" } : {} };
      const verification = d.verification || "unverified";
      let id = existing?.id;
      if (id) {
        await tx`update wineries set name = ${d.name}, region_id = ${region.id}, subregion_id = ${sub?.id ?? null}, district_id = ${dist?.id ?? null},
          island = ${d.island || null}, website = coalesce(${d.website || null}, website), email = coalesce(${d.email || null}, email),
          phone = coalesce(${d.phone || null}, phone), founded_year = coalesce(${d.founded_year ? Number(d.founded_year) : null}, founded_year),
          family_run = coalesce(${d.family_run}, family_run), size_category = coalesce(${d.size_category || null}, size_category),
          updated_at = now() where id = ${id}`;
      } else {
        const [w] = await tx<{ id: number }[]>`insert into wineries (slug, name, status, region_id, subregion_id, district_id, island, website, email, phone,
            founded_year, family_run, size_category, content, verification)
          values (${slug}, ${d.name}, ${d.status || "draft"}, ${region.id}, ${sub?.id ?? null}, ${dist?.id ?? null}, ${d.island || null}, ${d.website || null},
            ${d.email || null}, ${d.phone || null}, ${d.founded_year ? Number(d.founded_year) : null}, ${d.family_run}, ${d.size_category || null},
            ${tx.json(content)}, ${verification}) returning id`;
        id = w.id;
      }
      if (d.town || d.lat) {
        const geom = d.lat && d.lng ? tx`ST_SetSRID(ST_MakePoint(${Number(d.lng)}, ${Number(d.lat)}), 4326)::geography` : tx`null`;
        await tx`delete from winery_locations where winery_id = ${id} and is_primary and geocode_source = 'import'`;
        const hasPrimary = (await tx`select 1 from winery_locations where winery_id = ${id} and is_primary`).length > 0;
        if (!hasPrimary) {
          await tx`insert into winery_locations (winery_id, kind, address, postal_code, town, municipality, county, geom, precision, is_primary, geocode_source, source_id, verification)
            values (${id}, 'winery', ${d.address || null}, ${d.postal_code || null}, ${d.town}, ${d.municipality || null}, ${d.county || null}, ${geom},
              ${d.precision || (d.address ? "address" : "settlement")}, true, 'import', ${src.id}, ${verification})`;
        }
      }
      const sig = new Set(d.signature_grapes.split(/[;|]/).map((s) => s.trim()).filter(Boolean));
      for (const g of grapeSlugs) {
        const gid = grapes.find((x) => x.slug === g)!.id;
        await tx`insert into winery_grape_varieties (winery_id, grape_id, relation, is_signature, source_id, verification)
          values (${id}, ${gid}, 'unknown', ${sig.has(g)}, ${src.id}, ${verification}) on conflict (winery_id, grape_id) do update set is_signature = excluded.is_signature`;
      }
      await tx`select refresh_winery_search(${id!})`;
    });
  }

  const count = (a: ImportRowReport["action"]) => report.filter((r) => r.action === a).length;
  await sql`update data_import_jobs set status = 'completed', created_rows = ${opts.dryRun ? 0 : count("create")}, updated_rows = ${opts.dryRun ? 0 : count("update")},
    skipped_rows = ${count("skip") + count("error")}, report = ${sql.json(report as never)}, finished_at = now() where id = ${job.id}`;
  return { jobId: job.id, dryRun: opts.dryRun, total: rows.length, create: count("create"), update: count("update"), skip: count("skip"), error: count("error"), rows: report };
}

export async function importWineriesCsv(text: string, opts: { dryRun: boolean; userId: string | null; filename?: string }) {
  const { sql } = await import("./db");
  return importWineriesCsvWith(sql, text, opts);
}
