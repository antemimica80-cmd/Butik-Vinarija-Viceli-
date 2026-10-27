"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql, pgArrayLiteral } from "@/lib/db";
import { requireWineryManager, isStaff } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { applyWineryEdit, parseWineryForm } from "@/lib/winery-mutations";
import { slugify } from "@/lib/norm";
import { sendEmail } from "@/lib/email";
import { EXPERIENCE_KINDS, MEDALS, VISIT_LANGUAGES, WINE_TYPES } from "@/lib/constants";
import { storeUpload, UploadError } from "@/lib/uploads";

export type OwnerResult = { ok: true; message?: "submitted" | "published" } | { ok: false; error: string; fields?: string[] };

const wineryIdOf = (fd: FormData) => z.coerce.number().int().positive().parse(fd.get("wineryId"));
const refresh = () => revalidatePath("/[locale]", "layout");

// ───────────── Profile ─────────────
export async function saveProfile(_: OwnerResult | null, fd: FormData): Promise<OwnerResult> {
  const wineryId = wineryIdOf(fd);
  const user = await requireWineryManager(wineryId);
  const parsed = parseWineryForm(fd);
  if (!parsed.success) return { ok: false, error: "validation", fields: [...new Set(parsed.error.issues.map((i) => i.path.join(".")))] };
  if (isStaff(user)) {
    await applyWineryEdit(wineryId, parsed.data, user.id, "editor_verified");
    refresh();
    return { ok: true, message: "published" };
  }
  // Owners: public changes are reviewed by an editor before publication.
  await sql`insert into change_requests (winery_id, submitted_by, entity_type, payload)
    values (${wineryId}, ${user.id}, 'winery_profile', ${sql.json(parsed.data as never)})`;
  await audit(user.id, "change_request.create", "winery", wineryId);
  refresh();
  return { ok: true, message: "submitted" };
}

// ───────────── Wines ─────────────
const wineSchema = z.object({
  wineryId: z.coerce.number().int().positive(),
  wineId: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(1).max(160),
  type: z.enum(WINE_TYPES),
  styles: z.array(z.string().regex(/^[a-z_]{2,30}$/)).max(8),
  site: z.string().regex(/^[a-z0-9-]*$/).optional(),
  grapes: z.array(z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), percentage: z.number().min(0.1).max(100).nullable() })).max(12),
  description_hr: z.string().max(4000), description_en: z.string().max(4000),
  tasting_hr: z.string().max(3000), tasting_en: z.string().max(3000),
  pairing_hr: z.string().max(1500), pairing_en: z.string().max(1500),
  serving_temp: z.string().max(40), aging_potential: z.string().max(80),
  purchase_url: z.string().trim().max(300).url().refine((u) => /^https?:\/\//.test(u)).or(z.literal("")),
});

export async function saveWine(_: OwnerResult | null, fd: FormData): Promise<OwnerResult> {
  const s = (k: string) => String(fd.get(k) ?? "");
  const grapeSlugs = fd.getAll("grape").map(String).filter(Boolean);
  const p = wineSchema.safeParse({
    wineryId: fd.get("wineryId"), wineId: fd.get("wineId") || undefined, name: s("name"), type: s("type"),
    styles: fd.getAll("styles").map(String), site: s("site") || undefined,
    grapes: grapeSlugs.map((g) => ({ slug: g, percentage: s(`pct.${g}`) ? Number(s(`pct.${g}`)) : null })),
    description_hr: s("description_hr"), description_en: s("description_en"), tasting_hr: s("tasting_hr"), tasting_en: s("tasting_en"),
    pairing_hr: s("pairing_hr"), pairing_en: s("pairing_en"), serving_temp: s("serving_temp"), aging_potential: s("aging_potential"),
    purchase_url: s("purchase_url"),
  });
  if (!p.success) return { ok: false, error: "validation", fields: p.error.issues.map((i) => i.path.join(".")) };
  const d = p.data;
  const user = await requireWineryManager(d.wineryId);
  const total = d.grapes.reduce((a, g) => a + (g.percentage ?? 0), 0);
  if (total > 100.01) return { ok: false, error: "validation", fields: ["grapes"] };
  const content = {
    hr: { description: d.description_hr, tasting_notes: d.tasting_hr, pairing: d.pairing_hr, status: "owner_original" },
    en: { description: d.description_en, tasting_notes: d.tasting_en, pairing: d.pairing_en, status: "owner_original" },
  };
  const state = isStaff(user) ? "editor_verified" : "owner_submitted";
  const [{ slug: winerySlug }] = await sql<{ slug: string }[]>`select slug from wineries where id = ${d.wineryId}`;
  const [site] = d.site ? await sql<{ id: number }[]>`select id from vineyard_sites where slug = ${d.site}` : [];
  let wineId = d.wineId;
  if (wineId) {
    const own = await sql`select 1 from wines where id = ${wineId} and winery_id = ${d.wineryId}`;
    if (!own.length) return { ok: false, error: "forbidden" };
    await sql`update wines set name = ${d.name}, type = ${d.type}, styles = ${pgArrayLiteral(d.styles)}::text[], vineyard_site_id = ${site?.id ?? null},
      content = ${sql.json(content)}, serving_temp = ${d.serving_temp || null}, aging_potential = ${d.aging_potential || null},
      purchase_url = ${d.purchase_url || null}, verification = ${state}, updated_at = now() where id = ${wineId}`;
  } else {
    let slug = `${winerySlug}-${slugify(d.name)}`;
    if ((await sql`select 1 from wines where slug = ${slug}`).length) slug = `${slug}-${Date.now().toString(36)}`;
    const [row] = await sql<{ id: number }[]>`insert into wines (winery_id, slug, name, type, styles, vineyard_site_id, content, serving_temp, aging_potential, purchase_url, verification)
      values (${d.wineryId}, ${slug}, ${d.name}, ${d.type}, ${pgArrayLiteral(d.styles)}::text[], ${site?.id ?? null}, ${sql.json(content)},
        ${d.serving_temp || null}, ${d.aging_potential || null}, ${d.purchase_url || null}, ${state}) returning id`;
    wineId = row.id;
  }
  await sql`delete from wine_grape_compositions where wine_id = ${wineId} and vintage_id is null`;
  for (const g of d.grapes) {
    const [gr] = await sql<{ id: number }[]>`select id from grape_varieties where slug = ${g.slug}`;
    if (gr) await sql`insert into wine_grape_compositions (wine_id, grape_id, percentage) values (${wineId}, ${gr.id}, ${g.percentage})`;
  }
  await sql`select refresh_winery_search(${d.wineryId})`;
  await audit(user.id, d.wineId ? "wine.update" : "wine.create", "wine", wineId!);
  refresh();
  return { ok: true, message: "published" };
}

const vintageSchema = z.object({
  wineryId: z.coerce.number().int().positive(), wineId: z.coerce.number().int().positive(),
  year: z.coerce.number().int().min(1900).max(2100).nullable(),
  alcohol: z.coerce.number().min(0).max(25).nullable(), sugar: z.coerce.number().min(0).max(500).nullable(),
  acidity: z.coerce.number().min(0).max(30).nullable(), barrel: z.string().max(200), price: z.coerce.number().min(0).max(100000).nullable(),
});
const numOrNull = (v: FormDataEntryValue | null) => (v == null || v === "" ? null : v);

export async function saveVintage(_: OwnerResult | null, fd: FormData): Promise<OwnerResult> {
  const p = vintageSchema.safeParse({
    wineryId: fd.get("wineryId"), wineId: fd.get("wineId"), year: numOrNull(fd.get("year")), alcohol: numOrNull(fd.get("alcohol")),
    sugar: numOrNull(fd.get("sugar")), acidity: numOrNull(fd.get("acidity")), barrel: String(fd.get("barrel") ?? ""), price: numOrNull(fd.get("price")),
  });
  if (!p.success) return { ok: false, error: "validation", fields: p.error.issues.map((i) => i.path.join(".")) };
  const d = p.data;
  const user = await requireWineryManager(d.wineryId);
  if (!(await sql`select 1 from wines where id = ${d.wineId} and winery_id = ${d.wineryId}`).length) return { ok: false, error: "forbidden" };
  const state = isStaff(user) ? "editor_verified" : "owner_submitted";
  const existing = await sql<{ id: number }[]>`select id from wine_vintages where wine_id = ${d.wineId} and year is not distinct from ${d.year}`;
  if (existing.length) {
    await sql`update wine_vintages set alcohol_pct = ${d.alcohol}, residual_sugar_gl = ${d.sugar}, total_acidity_gl = ${d.acidity},
      barrel = ${d.barrel || null}, price_eur = ${d.price}, verification = ${state} where id = ${existing[0].id}`;
  } else {
    await sql`insert into wine_vintages (wine_id, year, alcohol_pct, residual_sugar_gl, total_acidity_gl, barrel, price_eur, verification)
      values (${d.wineId}, ${d.year}, ${d.alcohol}, ${d.sugar}, ${d.acidity}, ${d.barrel || null}, ${d.price}, ${state})`;
  }
  await audit(user.id, "vintage.save", "wine", d.wineId, { year: d.year });
  refresh();
  return { ok: true, message: "published" };
}

export async function deleteWine(fd: FormData) {
  const wineryId = wineryIdOf(fd);
  const user = await requireWineryManager(wineryId);
  const wineId = z.coerce.number().int().positive().parse(fd.get("wineId"));
  await sql`update wines set status = 'archived' where id = ${wineId} and winery_id = ${wineryId}`;
  await sql`select refresh_winery_search(${wineryId})`;
  await audit(user.id, "wine.archive", "wine", wineId);
  refresh();
}

/** Award documentation from owners is stored unverified and is never public until an editor verifies it. */
export async function submitAward(_: OwnerResult | null, fd: FormData): Promise<OwnerResult> {
  const p = z.object({
    wineryId: z.coerce.number().int().positive(), wineId: z.coerce.number().int().positive(),
    competition: z.string().regex(/^[a-z0-9-]+$/), year: z.coerce.number().int().min(1950).max(2100),
    vintage: z.coerce.number().int().min(1900).max(2100).nullable(), medal: z.enum(MEDALS),
    score: z.coerce.number().min(0).max(100).nullable(), sourceUrl: z.string().trim().url().refine((u) => /^https?:\/\//.test(u)),
  }).safeParse({
    wineryId: fd.get("wineryId"), wineId: fd.get("wineId"), competition: fd.get("competition"), year: fd.get("year"),
    vintage: numOrNull(fd.get("vintage")), medal: fd.get("medal"), score: numOrNull(fd.get("score")), sourceUrl: fd.get("sourceUrl"),
  });
  if (!p.success) return { ok: false, error: "validation", fields: p.error.issues.map((i) => i.path.join(".")) };
  const d = p.data;
  const user = await requireWineryManager(d.wineryId);
  if (!(await sql`select 1 from wines where id = ${d.wineId} and winery_id = ${d.wineryId}`).length) return { ok: false, error: "forbidden" };
  const [c] = await sql<{ id: number }[]>`select id from competitions where slug = ${d.competition}`;
  if (!c) return { ok: false, error: "validation", fields: ["competition"] };
  const [v] = d.vintage ? await sql<{ id: number }[]>`select id from wine_vintages where wine_id = ${d.wineId} and year = ${d.vintage}` : [];
  await sql`insert into wine_awards (competition_id, year, winery_id, wine_id, vintage_id, vintage_year, medal, score, source_url, verification, notes)
    values (${c.id}, ${d.year}, ${d.wineryId}, ${d.wineId}, ${v?.id ?? null}, ${d.vintage}, ${d.medal}, ${d.score}, ${d.sourceUrl}, 'owner_submitted', 'Submitted by owner — awaiting editor verification')`;
  await audit(user.id, "award.submit", "wine", d.wineId);
  return { ok: true, message: "submitted" };
}

// ───────────── Experiences ─────────────
const expSchema = z.object({
  wineryId: z.coerce.number().int().positive(), id: z.coerce.number().int().positive().optional(),
  kind: z.enum(EXPERIENCE_KINDS), name_hr: z.string().trim().min(2).max(160), name_en: z.string().trim().min(2).max(160),
  desc_hr: z.string().max(2000), desc_en: z.string().max(2000),
  wines: z.coerce.number().int().min(0).max(50).nullable(), duration: z.coerce.number().int().min(10).max(1440).nullable(),
  price: z.coerce.number().min(0).max(10000).nullable(), minGroup: z.coerce.number().int().min(1).max(500).nullable(),
  maxGroup: z.coerce.number().int().min(1).max(500).nullable(), food: z.boolean(), appointment: z.boolean(),
  languages: z.array(z.enum(VISIT_LANGUAGES)).max(10),
});

export async function saveExperience(_: OwnerResult | null, fd: FormData): Promise<OwnerResult> {
  const p = expSchema.safeParse({
    wineryId: fd.get("wineryId"), id: fd.get("id") || undefined, kind: fd.get("kind"),
    name_hr: fd.get("name_hr"), name_en: fd.get("name_en"), desc_hr: String(fd.get("desc_hr") ?? ""), desc_en: String(fd.get("desc_en") ?? ""),
    wines: numOrNull(fd.get("wines")), duration: numOrNull(fd.get("duration")), price: numOrNull(fd.get("price")),
    minGroup: numOrNull(fd.get("minGroup")), maxGroup: numOrNull(fd.get("maxGroup")),
    food: fd.get("food") === "on", appointment: fd.get("appointment") === "on", languages: fd.getAll("languages").map(String),
  });
  if (!p.success) return { ok: false, error: "validation", fields: p.error.issues.map((i) => i.path.join(".")) };
  const d = p.data;
  if (d.minGroup && d.maxGroup && d.minGroup > d.maxGroup) return { ok: false, error: "validation", fields: ["minGroup"] };
  const user = await requireWineryManager(d.wineryId);
  const state = isStaff(user) ? "editor_verified" : "owner_submitted";
  const name = sql.json({ hr: d.name_hr, en: d.name_en });
  const desc = sql.json({ hr: d.desc_hr, en: d.desc_en });
  if (d.id) {
    const res = await sql`update tasting_experiences set kind = ${d.kind}, name = ${name}, description = ${desc}, wines_included = ${d.wines},
      duration_min = ${d.duration}, price_eur = ${d.price}, min_group = ${d.minGroup}, max_group = ${d.maxGroup}, food_included = ${d.food},
      appointment_required = ${d.appointment}, languages = ${pgArrayLiteral(d.languages)}::text[], verification = ${state}, source_id = null, updated_at = now()
      where id = ${d.id} and winery_id = ${d.wineryId}`;
    if (!res.count) return { ok: false, error: "forbidden" };
  } else {
    await sql`insert into tasting_experiences (winery_id, kind, name, description, wines_included, duration_min, price_eur, min_group, max_group,
      food_included, appointment_required, languages, verification)
      values (${d.wineryId}, ${d.kind}, ${name}, ${desc}, ${d.wines}, ${d.duration}, ${d.price}, ${d.minGroup}, ${d.maxGroup}, ${d.food}, ${d.appointment},
        ${pgArrayLiteral(d.languages)}::text[], ${state})`;
  }
  await audit(user.id, d.id ? "experience.update" : "experience.create", "winery", d.wineryId);
  refresh();
  return { ok: true, message: "published" };
}

export async function toggleExperience(fd: FormData) {
  const wineryId = wineryIdOf(fd);
  const user = await requireWineryManager(wineryId);
  const id = z.coerce.number().int().positive().parse(fd.get("id"));
  await sql`update tasting_experiences set is_active = not is_active where id = ${id} and winery_id = ${wineryId}`;
  await audit(user.id, "experience.toggle", "winery", wineryId, { id });
  refresh();
}

// ───────────── Inquiries ─────────────
const STATUSES = ["new", "seen", "replied", "accepted", "declined", "closed", "spam"] as const;

export async function setInquiryStatus(fd: FormData) {
  const wineryId = wineryIdOf(fd);
  const user = await requireWineryManager(wineryId);
  const id = z.string().uuid().parse(fd.get("id"));
  const status = z.enum(STATUSES).parse(fd.get("status"));
  const res = await sql`update tasting_inquiries set status = ${status}, updated_at = now() where id = ${id} and winery_id = ${wineryId}`;
  if (res.count) await sql`insert into inquiry_events (inquiry_id, actor_user_id, kind, data) values (${id}, ${user.id}, 'status_changed', ${sql.json({ status })})`;
  refresh();
}

export async function replyInquiry(_: OwnerResult | null, fd: FormData): Promise<OwnerResult> {
  const wineryId = wineryIdOf(fd);
  const user = await requireWineryManager(wineryId);
  const id = z.string().uuid().parse(fd.get("id"));
  const reply = z.string().trim().min(2).max(5000).safeParse(fd.get("reply"));
  if (!reply.success) return { ok: false, error: "validation", fields: ["reply"] };
  const [inq] = await sql<{ email: string; full_name: string; public_ref: string; locale: string; winery_name: string; winery_email: string | null }[]>`
    select i.email, i.full_name, i.public_ref, i.locale, w.name as winery_name, w.email as winery_email
    from tasting_inquiries i join wineries w on w.id = i.winery_id where i.id = ${id} and i.winery_id = ${wineryId}`;
  if (!inq) return { ok: false, error: "forbidden" };
  await sql`update tasting_inquiries set owner_reply = ${reply.data}, replied_at = now(), status = case when status in ('new','seen') then 'replied' else status end, updated_at = now() where id = ${id}`;
  const mail = await sendEmail({
    to: inq.email, kind: "inquiry_reply", inquiryId: id,
    subject: inq.locale === "hr" ? `Odgovor vinarije ${inq.winery_name} (${inq.public_ref})` : `Reply from ${inq.winery_name} (${inq.public_ref})`,
    text: `${inq.full_name},\n\n${reply.data}\n\n— ${inq.winery_name}${inq.winery_email ? ` (${inq.winery_email})` : ""}`,
  });
  await sql`insert into inquiry_events (inquiry_id, actor_user_id, kind, data) values (${id}, ${user.id}, 'replied', ${sql.json({ email: mail.status })})`;
  refresh();
  return { ok: true, message: "published" };
}

// ───────────── Media ─────────────
export async function uploadMedia(_: OwnerResult | null, fd: FormData): Promise<OwnerResult> {
  const wineryId = wineryIdOf(fd);
  const user = await requireWineryManager(wineryId);
  if (fd.get("rights") !== "on") return { ok: false, error: "rights" };
  const kind = z.enum(["logo", "hero", "gallery", "tasting_room", "historic", "bottle", "tech_sheet"]).parse(fd.get("kind"));
  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return { ok: false, error: "validation", fields: ["file"] };
  try {
    const stored = await storeUpload(file, `wineries/${wineryId}`, kind === "tech_sheet" ? ["application/pdf"] : ["image/jpeg", "image/png", "image/webp"]);
    await sql`insert into media (winery_id, kind, storage_path, mime, bytes, width, height, alt, caption, credit, license, rights_confirmed_at, status, uploaded_by)
      values (${wineryId}, ${kind}, ${stored.path}, ${stored.mime}, ${stored.bytes}, ${stored.width}, ${stored.height},
        ${sql.json({ hr: String(fd.get("alt_hr") ?? "").slice(0, 300), en: String(fd.get("alt_en") ?? "").slice(0, 300) })},
        ${sql.json({ hr: String(fd.get("caption_hr") ?? "").slice(0, 300), en: String(fd.get("caption_en") ?? "").slice(0, 300) })},
        ${String(fd.get("credit") ?? "").slice(0, 200) || null}, 'owner_provided', now(), ${isStaff(user) ? "approved" : "pending"}, ${user.id})`;
    await audit(user.id, "media.upload", "winery", wineryId, { kind });
  } catch (e) {
    if (e instanceof UploadError) return { ok: false, error: e.code };
    throw e;
  }
  refresh();
  return { ok: true, message: isStaff(user) ? "published" : "submitted" };
}

export async function setMediaRole(fd: FormData) {
  const wineryId = wineryIdOf(fd);
  const user = await requireWineryManager(wineryId);
  const id = z.coerce.number().int().positive().parse(fd.get("mediaId"));
  const role = z.enum(["hero", "logo"]).parse(fd.get("role"));
  const [m] = await sql`select 1 from media where id = ${id} and winery_id = ${wineryId} and status = 'approved'`;
  if (!m) return;
  if (role === "hero") await sql`update wineries set hero_media_id = ${id} where id = ${wineryId}`;
  else await sql`update wineries set logo_media_id = ${id} where id = ${wineryId}`;
  await audit(user.id, `media.set_${role}`, "winery", wineryId, { id });
  refresh();
}

export async function deleteMedia(fd: FormData) {
  const wineryId = wineryIdOf(fd);
  const user = await requireWineryManager(wineryId);
  const id = z.coerce.number().int().positive().parse(fd.get("mediaId"));
  await sql`update wineries set hero_media_id = null where id = ${wineryId} and hero_media_id = ${id}`;
  await sql`update wineries set logo_media_id = null where id = ${wineryId} and logo_media_id = ${id}`;
  await sql`delete from media where id = ${id} and winery_id = ${wineryId}`;
  await audit(user.id, "media.delete", "winery", wineryId, { id });
  refresh();
}
