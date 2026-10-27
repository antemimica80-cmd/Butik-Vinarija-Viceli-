"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql, pgArrayLiteral } from "@/lib/db";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { applyWineryEdit, parseWineryForm, wineryEditSchema } from "@/lib/winery-mutations";
import { slugify } from "@/lib/norm";
import { flushOutbox } from "@/lib/email";
import { MEDALS, VERIFICATION_STATES } from "@/lib/constants";
import { importWineriesCsv } from "@/lib/importer";

type R = { ok: true; message?: string } | { ok: false; error: string; fields?: string[] };
const refresh = () => revalidatePath("/[locale]", "layout");
const num = (v: FormDataEntryValue | null) => (v == null || v === "" ? null : Number(v));
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

// ───────────── Wineries ─────────────
const adminWinerySchema = z.object({
  name: z.string().min(2).max(160),
  slug: z.string().regex(/^[a-z0-9-]{2,80}$/),
  alt_names: z.array(z.string().max(160)).max(10),
  status: z.enum(["draft", "published", "archived"]),
  region: z.string().regex(/^[a-z0-9-]*$/),
  subregion: z.string().regex(/^[a-z0-9-]*$/),
  district: z.string().regex(/^[a-z0-9-]*$/),
  island: z.string().max(80),
  is_featured: z.boolean(), is_sponsored: z.boolean(), featured_rank: z.number().int().min(1).max(999).nullable(),
  verification: z.enum(VERIFICATION_STATES),
  loc: z.object({
    address: z.string().max(200), postal: z.string().max(12), town: z.string().max(100), municipality: z.string().max(100), county: z.string().max(100),
    lat: z.number().min(42).max(47).nullable(), lng: z.number().min(13).max(20).nullable(),
    precision: z.enum(["exact", "address", "settlement", "approximate"]),
  }),
});

function parseAdminWinery(fd: FormData) {
  return adminWinerySchema.safeParse({
    name: str(fd, "name"), slug: str(fd, "slug"), alt_names: str(fd, "alt_names").split(",").map((s) => s.trim()).filter(Boolean),
    status: str(fd, "status"), region: str(fd, "region"), subregion: str(fd, "subregion"), district: str(fd, "district"), island: str(fd, "island"),
    is_featured: fd.get("is_featured") === "on", is_sponsored: fd.get("is_sponsored") === "on", featured_rank: num(fd.get("featured_rank")),
    verification: str(fd, "verification") || "unverified",
    loc: { address: str(fd, "loc.address"), postal: str(fd, "loc.postal"), town: str(fd, "loc.town"), municipality: str(fd, "loc.municipality"),
      county: str(fd, "loc.county"), lat: num(fd.get("loc.lat")), lng: num(fd.get("loc.lng")), precision: str(fd, "loc.precision") || "approximate" },
  });
}

async function geoIds(region: string, subregion: string, district: string) {
  const [r] = region ? await sql<{ id: number }[]>`select id from wine_regions where slug = ${region}` : [];
  const [s] = subregion ? await sql<{ id: number; region_id: number }[]>`select id, region_id from wine_subregions where slug = ${subregion}` : [];
  const [d] = district ? await sql<{ id: number; subregion_id: number }[]>`select id, subregion_id from wine_districts where slug = ${district}` : [];
  if (s && r && s.region_id !== r.id) throw new Error("Subregion does not belong to region");
  if (d && s && d.subregion_id !== s.id) throw new Error("District does not belong to subregion");
  return { region: r?.id ?? null, subregion: s?.id ?? null, district: d?.id ?? null };
}

async function saveLocation(wineryId: number, loc: z.infer<typeof adminWinerySchema>["loc"]) {
  const geom = loc.lat != null && loc.lng != null ? sql`ST_SetSRID(ST_MakePoint(${loc.lng}, ${loc.lat}), 4326)::geography` : sql`null`;
  const [p] = await sql<{ id: number }[]>`select id from winery_locations where winery_id = ${wineryId} and is_primary`;
  if (p) {
    await sql`update winery_locations set address = ${loc.address || null}, postal_code = ${loc.postal || null}, town = ${loc.town || null},
      municipality = ${loc.municipality || null}, county = ${loc.county || null}, geom = ${geom}, precision = ${loc.precision},
      geocode_source = 'admin', verified_at = case when ${loc.precision} in ('exact','address') then now() else verified_at end where id = ${p.id}`;
  } else if (loc.town || loc.lat != null) {
    await sql`insert into winery_locations (winery_id, kind, address, postal_code, town, municipality, county, geom, precision, is_primary, geocode_source)
      values (${wineryId}, 'winery', ${loc.address || null}, ${loc.postal || null}, ${loc.town || null}, ${loc.municipality || null}, ${loc.county || null}, ${geom}, ${loc.precision}, true, 'admin')`;
  }
}

export async function createWinery(_: R | null, fd: FormData): Promise<R> {
  const user = await requireStaff();
  const name = str(fd, "name");
  if (name.length < 2) return { ok: false, error: "validation", fields: ["name"] };
  let slug = slugify(str(fd, "slug") || name);
  if ((await sql`select 1 from wineries where slug = ${slug}`).length) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  const ids = await geoIds(str(fd, "region"), "", "");
  const [w] = await sql<{ id: number }[]>`insert into wineries (slug, name, status, region_id, content) values (${slug}, ${name}, 'draft', ${ids.region}, ${sql.json({})}) returning id`;
  await audit(user.id, "winery.create", "winery", w.id, { name });
  redirect(`/${str(fd, "locale") || "en"}/admin/wineries/${w.id}`);
}

export async function saveWineryAdmin(_: R | null, fd: FormData): Promise<R> {
  const user = await requireStaff();
  const id = z.coerce.number().int().positive().parse(fd.get("wineryId"));
  const a = parseAdminWinery(fd);
  if (!a.success) return { ok: false, error: "validation", fields: a.error.issues.map((i) => i.path.join(".")) };
  const p = parseWineryForm(fd);
  if (!p.success) return { ok: false, error: "validation", fields: p.error.issues.map((i) => i.path.join(".")) };
  const d = a.data;
  const clash = await sql`select 1 from wineries where slug = ${d.slug} and id <> ${id}`;
  if (clash.length) return { ok: false, error: "validation", fields: ["slug"] };
  let ids;
  try { ids = await geoIds(d.region, d.subregion, d.district); } catch (e) { return { ok: false, error: (e as Error).message }; }
  await sql`update wineries set name = ${d.name}, slug = ${d.slug}, alt_names = ${pgArrayLiteral(d.alt_names)}::text[], status = ${d.status},
    region_id = ${ids.region}, subregion_id = ${ids.subregion}, district_id = ${ids.district}, island = ${d.island || null},
    is_featured = ${d.is_featured}, is_sponsored = ${d.is_sponsored}, featured_rank = ${d.featured_rank},
    verification = ${d.verification}, verified_at = case when ${d.verification} in ('editor_verified','officially_verified') then now() else verified_at end
    where id = ${id}`;
  await saveLocation(id, d.loc);
  await applyWineryEdit(id, p.data, user.id, "editor_verified");
  // applyWineryEdit may promote verification for owner edits; restore the editor's explicit choice.
  await sql`update wineries set verification = ${d.verification} where id = ${id}`;
  await sql`select refresh_winery_search(${id})`;
  await audit(user.id, "winery.admin_update", "winery", id, { status: d.status, verification: d.verification });
  refresh();
  return { ok: true, message: "published" };
}

export async function addOwner(_: R | null, fd: FormData): Promise<R> {
  const user = await requireStaff();
  const wineryId = z.coerce.number().int().positive().parse(fd.get("wineryId"));
  const email = str(fd, "email").toLowerCase();
  const [u] = await sql<{ id: string; role: string }[]>`select id, role from users where lower(email) = ${email}`;
  if (!u) return { ok: false, error: "user_not_found" };
  await sql`insert into winery_owners (winery_id, user_id, role, granted_by) values (${wineryId}, ${u.id}, 'owner', ${user.id}) on conflict do nothing`;
  if (u.role === "visitor") await sql`update users set role = 'owner' where id = ${u.id}`;
  await audit(user.id, "owner.add", "winery", wineryId, { email });
  refresh();
  return { ok: true };
}

export async function removeOwner(fd: FormData) {
  const user = await requireStaff();
  const wineryId = z.coerce.number().int().positive().parse(fd.get("wineryId"));
  const uid = z.string().uuid().parse(fd.get("userId"));
  await sql`delete from winery_owners where winery_id = ${wineryId} and user_id = ${uid}`;
  await audit(user.id, "owner.remove", "winery", wineryId, { uid });
  refresh();
}

export async function recordVerification(_: R | null, fd: FormData): Promise<R> {
  const user = await requireStaff();
  const p = z.object({
    entityType: z.enum(["winery", "wine", "award", "location"]), entityId: z.string().max(40), field: z.string().max(80),
    state: z.enum(VERIFICATION_STATES), method: z.enum(["website_check", "official_registry", "official_regulation", "owner_document", "phone_call", "site_visit", "competition_results", "press", "other"]),
    sourceUrl: z.string().url().or(z.literal("")), notes: z.string().max(2000),
  }).safeParse({ entityType: fd.get("entityType"), entityId: fd.get("entityId"), field: str(fd, "field"), state: fd.get("state"), method: fd.get("method"), sourceUrl: str(fd, "sourceUrl"), notes: str(fd, "notes") });
  if (!p.success) return { ok: false, error: "validation", fields: p.error.issues.map((i) => i.path.join(".")) };
  const d = p.data;
  let sourceId: number | null = null;
  if (d.sourceUrl) {
    const [s] = await sql<{ id: number }[]>`insert into data_sources (name, url, kind) values (${d.sourceUrl}, ${d.sourceUrl}, 'other')
      on conflict (name, url) do update set name = excluded.name returning id`;
    sourceId = s.id;
  }
  await sql`insert into data_verifications (entity_type, entity_id, field, state, method, source_id, verified_by, notes)
    values (${d.entityType}, ${d.entityId}, ${d.field || null}, ${d.state}, ${d.method}, ${sourceId}, ${user.id}, ${d.notes || null})`;
  if (d.entityType === "winery" && !d.field) {
    await sql`update wineries set verification = ${d.state}, verified_at = now() where id = ${Number(d.entityId)}`;
  }
  await audit(user.id, "verification.record", d.entityType, d.entityId, { state: d.state, method: d.method });
  refresh();
  return { ok: true };
}

// ───────────── Change requests & media moderation ─────────────
export async function reviewChange(fd: FormData) {
  const user = await requireStaff();
  const id = z.string().uuid().parse(fd.get("id"));
  const decision = z.enum(["approve", "reject"]).parse(fd.get("decision"));
  const [cr] = await sql<{ winery_id: number; payload: unknown; status: string }[]>`select winery_id, payload, status from change_requests where id = ${id}`;
  if (!cr || cr.status !== "pending") return;
  if (decision === "approve") {
    const p = wineryEditSchema.parse(cr.payload);
    await applyWineryEdit(cr.winery_id, p, user.id, "owner_submitted");
  }
  await sql`update change_requests set status = ${decision === "approve" ? "approved" : "rejected"}, reviewer_id = ${user.id}, reviewed_at = now(),
    reviewer_notes = ${str(fd, "notes") || null} where id = ${id}`;
  await audit(user.id, `change_request.${decision}`, "winery", cr.winery_id, { id });
  refresh();
}

export async function moderateMedia(fd: FormData) {
  const user = await requireStaff();
  const id = z.coerce.number().int().positive().parse(fd.get("id"));
  const status = z.enum(["approved", "rejected"]).parse(fd.get("status"));
  await sql`update media set status = ${status} where id = ${id}`;
  await audit(user.id, `media.${status}`, "media", id);
  refresh();
}

// ───────────── Claims ─────────────
export async function reviewClaim(fd: FormData) {
  const user = await requireStaff();
  const id = z.string().uuid().parse(fd.get("id"));
  const decision = z.enum(["approved", "rejected", "needs_info"]).parse(fd.get("decision"));
  const [c] = await sql<{ winery_id: number | null; user_id: string | null; claimant_email: string; proposed_winery_name: string | null; status: string }[]>`
    select winery_id, user_id, claimant_email, proposed_winery_name, status from ownership_claims where id = ${id}`;
  if (!c) return;
  let wineryId = c.winery_id;
  if (decision === "approved") {
    if (!wineryId && c.proposed_winery_name) {
      let slug = slugify(c.proposed_winery_name);
      if ((await sql`select 1 from wineries where slug = ${slug}`).length) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      const [w] = await sql<{ id: number }[]>`insert into wineries (slug, name, status, content) values (${slug}, ${c.proposed_winery_name}, 'draft', ${sql.json({})}) returning id`;
      wineryId = w.id;
      await sql`update ownership_claims set winery_id = ${wineryId} where id = ${id}`;
    }
    // Only the account that submitted the claim is linked. Email addresses are not verified on
    // registration, so we never grant ownership by matching an email; editors use "Add owner" instead.
    if (c.user_id && wineryId) {
      await sql`insert into winery_owners (winery_id, user_id, role, granted_by) values (${wineryId}, ${c.user_id}, 'owner', ${user.id}) on conflict do nothing`;
      await sql`update users set role = 'owner' where id = ${c.user_id} and role = 'visitor'`;
    }
  }
  await sql`update ownership_claims set status = ${decision}, reviewer_id = ${user.id}, reviewed_at = now(), reviewer_notes = ${str(fd, "notes") || null} where id = ${id}`;
  await audit(user.id, `claim.${decision}`, "winery", wineryId, { id });
  refresh();
}

// ───────────── Awards ─────────────
export async function createAward(_: R | null, fd: FormData): Promise<R> {
  const user = await requireStaff();
  const p = z.object({
    wineId: z.coerce.number().int().positive(), competition: z.string().regex(/^[a-z0-9-]+$/), year: z.coerce.number().int().min(1950).max(2100),
    vintage: z.coerce.number().int().min(1900).max(2100).nullable(), medal: z.enum(MEDALS), medalLabel: z.string().max(80),
    score: z.coerce.number().min(0).max(100).nullable(), category: z.string().max(160),
    sourceUrl: z.string().url().refine((u) => /^https?:\/\//.test(u)), verification: z.enum(VERIFICATION_STATES),
  }).safeParse({
    wineId: fd.get("wineId"), competition: fd.get("competition"), year: fd.get("year"), vintage: num(fd.get("vintage")), medal: fd.get("medal"),
    medalLabel: str(fd, "medalLabel"), score: num(fd.get("score")), category: str(fd, "category"), sourceUrl: str(fd, "sourceUrl"), verification: fd.get("verification"),
  });
  if (!p.success) return { ok: false, error: "validation", fields: p.error.issues.map((i) => i.path.join(".")) };
  const d = p.data;
  const [wine] = await sql<{ winery_id: number }[]>`select winery_id from wines where id = ${d.wineId}`;
  const [c] = await sql<{ id: number; name: string }[]>`select id, name from competitions where slug = ${d.competition}`;
  if (!wine || !c) return { ok: false, error: "validation", fields: ["wineId", "competition"] };
  let vintageId: number | null = null;
  if (d.vintage) {
    const [v] = await sql<{ id: number }[]>`insert into wine_vintages (wine_id, year) values (${d.wineId}, ${d.vintage})
      on conflict (wine_id, year) do update set year = excluded.year returning id`;
    vintageId = v.id;
  }
  const [src] = await sql<{ id: number }[]>`insert into data_sources (name, url, kind) values (${`${c.name} ${d.year} — official results`}, ${d.sourceUrl}, 'competition_results')
    on conflict (name, url) do update set kind = excluded.kind returning id`;
  const verified = d.verification === "editor_verified" || d.verification === "officially_verified";
  const [a] = await sql<{ id: number }[]>`insert into wine_awards (competition_id, year, winery_id, wine_id, vintage_id, vintage_year, medal, medal_label, score, category, source_url, source_id, verification, verified_at, verified_by)
    values (${c.id}, ${d.year}, ${wine.winery_id}, ${d.wineId}, ${vintageId}, ${d.vintage}, ${d.medal}, ${d.medalLabel || null}, ${d.score}, ${d.category || null},
      ${d.sourceUrl}, ${src.id}, ${d.verification}, ${verified ? sql`now()` : null}, ${verified ? user.id : null}) returning id`;
  await sql`select refresh_winery_search(${wine.winery_id})`;
  await audit(user.id, "award.create", "award", a.id, { verification: d.verification });
  refresh();
  return { ok: true };
}

export async function setAwardVerification(fd: FormData) {
  const user = await requireStaff();
  const id = z.coerce.number().int().positive().parse(fd.get("id"));
  const state = z.enum(VERIFICATION_STATES).parse(fd.get("state"));
  const verified = state === "editor_verified" || state === "officially_verified";
  const [a] = await sql<{ winery_id: number }[]>`update wine_awards set verification = ${state}, verified_at = ${verified ? sql`now()` : null}, verified_by = ${verified ? user.id : null}
    where id = ${id} returning winery_id`;
  if (a) await sql`select refresh_winery_search(${a.winery_id})`;
  await audit(user.id, "award.verify", "award", id, { state });
  refresh();
}

export async function deleteAward(fd: FormData) {
  const user = await requireStaff();
  const id = z.coerce.number().int().positive().parse(fd.get("id"));
  await sql`delete from wine_awards where id = ${id}`;
  await audit(user.id, "award.delete", "award", id);
  refresh();
}

// ───────────── Reports, users, email ─────────────
export async function resolveReport(fd: FormData) {
  const user = await requireStaff();
  const id = z.coerce.number().int().positive().parse(fd.get("id"));
  const status = z.enum(["resolved", "dismissed", "open"]).parse(fd.get("status"));
  await sql`update data_reports set status = ${status}, resolved_by = ${user.id} where id = ${id}`;
  await audit(user.id, `report.${status}`, "report", id);
  refresh();
}

export async function setUserRole(fd: FormData) {
  const admin = await requireAdmin();
  const id = z.string().uuid().parse(fd.get("id"));
  const role = z.enum(["visitor", "owner", "editor", "admin"]).parse(fd.get("role"));
  if (id === admin.id && role !== "admin") return; // never lock yourself out
  await sql`update users set role = ${role} where id = ${id}`;
  await audit(admin.id, "user.role", "user", id, { role });
  refresh();
}

export async function setUserDisabled(fd: FormData) {
  const admin = await requireAdmin();
  const id = z.string().uuid().parse(fd.get("id"));
  if (id === admin.id) return;
  const disabled = fd.get("disabled") === "1";
  await sql`update users set disabled_at = ${disabled ? sql`now()` : null} where id = ${id}`;
  if (disabled) await sql`delete from sessions where user_id = ${id}`;
  await audit(admin.id, disabled ? "user.disable" : "user.enable", "user", id);
  refresh();
}

export async function retryEmails() {
  const user = await requireStaff();
  const results = await flushOutbox(100);
  await audit(user.id, "email.flush", "email_outbox", null, { count: results.length });
  refresh();
}

// ───────────── Geography, grapes, articles ─────────────
export async function saveRegionContent(_: R | null, fd: FormData): Promise<R> {
  const user = await requireStaff();
  const id = z.coerce.number().int().positive().parse(fd.get("id"));
  const keys = ["tagline", "intro", "climate", "soil", "varieties", "styles"];
  const content = Object.fromEntries((["hr", "en"] as const).map((l) => [l, { ...Object.fromEntries(keys.map((k) => [k, str(fd, `${l}.${k}`).slice(0, 4000)])), status: str(fd, `${l}.status`) || "draft" }]));
  await sql`update wine_regions set content = ${sql.json(content)}, name = ${sql.json({ hr: str(fd, "name_hr"), en: str(fd, "name_en") })}, updated_at = now() where id = ${id}`;
  await audit(user.id, "region.update", "region", id);
  refresh();
  return { ok: true };
}

export async function addDistrict(_: R | null, fd: FormData): Promise<R> {
  const user = await requireStaff();
  const p = z.object({ subregion: z.string().regex(/^[a-z0-9-]+$/), official: z.string().min(2).max(120), en: z.string().max(120), sourceUrl: z.string().url().or(z.literal("")) })
    .safeParse({ subregion: fd.get("subregion"), official: str(fd, "official"), en: str(fd, "en"), sourceUrl: str(fd, "sourceUrl") });
  if (!p.success) return { ok: false, error: "validation", fields: p.error.issues.map((i) => i.path.join(".")) };
  const [s] = await sql<{ id: number }[]>`select id from wine_subregions where slug = ${p.data.subregion}`;
  if (!s) return { ok: false, error: "validation", fields: ["subregion"] };
  const slug = slugify(p.data.official);
  await sql`insert into wine_districts (subregion_id, slug, official_name, name, verification)
    values (${s.id}, ${slug}, ${p.data.official}, ${sql.json({ hr: p.data.official, en: p.data.en || p.data.official })}, ${p.data.sourceUrl ? "officially_verified" : "unverified"})
    on conflict (slug) do nothing`;
  await audit(user.id, "district.create", "district", slug);
  refresh();
  return { ok: true };
}

export async function saveGrape(_: R | null, fd: FormData): Promise<R> {
  const user = await requireStaff();
  const id = z.coerce.number().int().positive().parse(fd.get("id"));
  const p = z.object({
    name_hr: z.string().min(2).max(80), name_en: z.string().min(2).max(80), synonyms: z.array(z.string().max(80)).max(20),
    berry_color: z.enum(["white", "red", "grey"]), origin: z.enum(["indigenous", "regional", "international"]), parentage: z.string().max(300),
    verification: z.enum(VERIFICATION_STATES),
  }).safeParse({ name_hr: str(fd, "name_hr"), name_en: str(fd, "name_en"), synonyms: str(fd, "synonyms").split(",").map((s) => s.trim()).filter(Boolean),
    berry_color: fd.get("berry_color"), origin: fd.get("origin"), parentage: str(fd, "parentage"), verification: fd.get("verification") });
  if (!p.success) return { ok: false, error: "validation", fields: p.error.issues.map((i) => i.path.join(".")) };
  const keys = ["summary", "style", "aroma", "pairing"];
  const content = Object.fromEntries((["hr", "en"] as const).map((l) => [l, { ...Object.fromEntries(keys.map((k) => [k, str(fd, `${l}.${k}`).slice(0, 3000)])), status: str(fd, `${l}.status`) || "draft" }]));
  const d = p.data;
  await sql`update grape_varieties set name_hr = ${d.name_hr}, name_en = ${d.name_en}, synonyms = ${pgArrayLiteral(d.synonyms)}::text[], berry_color = ${d.berry_color},
    origin = ${d.origin}, parentage = ${d.parentage || null}, verification = ${d.verification}, content = ${sql.json(content)}, updated_at = now() where id = ${id}`;
  await sql`select refresh_grape_search(${id})`;
  await audit(user.id, "grape.update", "grape", id);
  refresh();
  return { ok: true };
}

export async function saveArticle(_: R | null, fd: FormData): Promise<R> {
  const user = await requireStaff();
  const idRaw = fd.get("id");
  const p = z.object({
    slug: z.string().regex(/^[a-z0-9-]{2,100}$/), category: z.enum(["regions", "grapes", "winemakers", "education", "travel", "experiences", "awards", "heritage", "history", "gastronomy", "methodology"]),
    status: z.enum(["draft", "published", "archived"]), author: z.string().max(120),
  }).safeParse({ slug: str(fd, "slug"), category: fd.get("category"), status: fd.get("status"), author: str(fd, "author") });
  if (!p.success) return { ok: false, error: "validation", fields: p.error.issues.map((i) => i.path.join(".")) };
  const content = Object.fromEntries((["hr", "en"] as const).map((l) => [l, { title: str(fd, `${l}.title`).slice(0, 200), excerpt: str(fd, `${l}.excerpt`).slice(0, 600), body: String(fd.get(`${l}.body`) ?? "").slice(0, 60000), status: str(fd, `${l}.status`) || "draft" }]));
  const sources = str(fd, "sources").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [label, url] = line.split("|").map((x) => x.trim());
    return { label, url: url && /^https?:\/\//.test(url) ? url : "" };
  }).filter((s) => s.url);
  const d = p.data;
  if (idRaw) {
    const id = Number(idRaw);
    await sql`update editorial_articles set slug = ${d.slug}, category = ${d.category}, status = ${d.status}, author_name = ${d.author || null},
      content = ${sql.json(content)}, sources = ${sql.json(sources)}, updated_at = now(),
      published_at = case when ${d.status} = 'published' and published_at is null then now() else published_at end where id = ${id}`;
    await audit(user.id, "article.update", "article", id);
  } else {
    const [a] = await sql<{ id: number }[]>`insert into editorial_articles (slug, category, status, content, author_name, sources, published_at)
      values (${d.slug}, ${d.category}, ${d.status}, ${sql.json(content)}, ${d.author || null}, ${sql.json(sources)}, ${d.status === "published" ? sql`now()` : null}) returning id`;
    await audit(user.id, "article.create", "article", a.id);
    redirect(`/${str(fd, "locale") || "en"}/admin/articles/${a.id}`);
  }
  refresh();
  return { ok: true };
}

// ───────────── Import ─────────────
export async function runImport(_: (R & { report?: unknown }) | null, fd: FormData): Promise<R & { report?: unknown }> {
  const user = await requireStaff();
  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return { ok: false, error: "validation", fields: ["file"] };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "too_large" };
  const dryRun = fd.get("commit") !== "1";
  const report = await importWineriesCsv(await file.text(), { dryRun, userId: user.id, filename: file.name });
  if (!dryRun) refresh();
  return { ok: true, message: dryRun ? "dry_run" : "imported", report };
}
