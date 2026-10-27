import "server-only";
import { z } from "zod";
import { sql, pgArrayLiteral } from "./db";
import { audit } from "./audit";
import { FACILITIES, SIZE_CATEGORIES, VISIT_LANGUAGES } from "./constants";

const httpUrl = z.string().trim().max(300).url().refine((u) => /^https?:\/\//i.test(u), "http").or(z.literal(""));
const text = (max: number) => z.string().trim().max(max).optional().default("");
const localeContent = z.object({
  short: text(400), description: text(6000), story: text(8000), philosophy: text(4000), winemaker_bio: text(3000),
});

/** Fields a winery owner may edit. Admin-only fields are validated separately. */
export const wineryEditSchema = z.object({
  content: z.object({ hr: localeContent, en: localeContent }),
  website: httpUrl, email: z.string().trim().max(200).email().or(z.literal("")),
  phone: text(40), whatsapp: text(40),
  instagram: httpUrl, facebook: httpUrl, youtube: httpUrl,
  opening_hours: z.object({ hr: text(400), en: text(400) }),
  appointment_only: z.boolean().nullable(),
  languages: z.array(z.enum(VISIT_LANGUAGES)).max(10),
  founded_year: z.number().int().min(1000).max(2100).nullable(),
  founder: text(160), owner_name: text(160), winemaker_name: text(160),
  family_run: z.boolean().nullable(),
  size_category: z.enum(SIZE_CATEGORIES).nullable(),
  grapes: z.array(z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), relation: z.enum(["grown", "purchased", "both", "unknown"]), is_signature: z.boolean() })).max(40),
  facilities: z.array(z.enum(FACILITIES)).max(FACILITIES.length),
});
export type WineryEdit = z.infer<typeof wineryEditSchema>;

/** Parse the owner profile form (FormData) into a WineryEdit. */
export function parseWineryForm(fd: FormData) {
  const s = (k: string) => String(fd.get(k) ?? "");
  const b = (k: string) => (fd.get(k) === "yes" ? true : fd.get(k) === "no" ? false : null);
  const grapeSlugs = fd.getAll("grape").map(String);
  return wineryEditSchema.safeParse({
    content: Object.fromEntries((["hr", "en"] as const).map((l) => [l, {
      short: s(`${l}.short`), description: s(`${l}.description`), story: s(`${l}.story`), philosophy: s(`${l}.philosophy`), winemaker_bio: s(`${l}.winemaker_bio`),
    }])),
    website: s("website"), email: s("email"), phone: s("phone"), whatsapp: s("whatsapp"),
    instagram: s("instagram"), facebook: s("facebook"), youtube: s("youtube"),
    opening_hours: { hr: s("hours.hr"), en: s("hours.en") },
    appointment_only: b("appointment_only"),
    languages: fd.getAll("languages").map(String),
    founded_year: s("founded_year") ? Number(s("founded_year")) : null,
    founder: s("founder"), owner_name: s("owner_name"), winemaker_name: s("winemaker_name"),
    family_run: b("family_run"),
    size_category: s("size_category") || null,
    grapes: grapeSlugs.map((slug) => ({ slug, relation: s(`grape.${slug}.relation`) || "unknown", is_signature: fd.get(`grape.${slug}.signature`) === "on" })),
    facilities: fd.getAll("facilities").map(String),
  });
}

const orNull = (v: string) => (v ? v : null);

/**
 * Apply an edit to a winery. `state` is the verification state recorded for owner-supplied
 * facts ("owner_submitted" when the change came from a verified owner).
 */
export async function applyWineryEdit(wineryId: number, e: WineryEdit, actorId: string | null, state: "owner_submitted" | "editor_verified") {
  const [prev] = await sql<{ content: Record<string, Record<string, string>> }[]>`select content from wineries where id = ${wineryId}`;
  const content: Record<string, Record<string, string>> = { ...(prev?.content ?? {}) };
  for (const l of ["hr", "en"] as const) {
    const before = prev?.content?.[l] ?? {};
    const next = e.content[l];
    const changed = (Object.keys(next) as (keyof typeof next)[]).some((k) => (next[k] || "") !== (before[k] || ""));
    const filled = Object.values(next).some(Boolean);
    content[l] = { ...Object.fromEntries(Object.entries(next).filter(([, v]) => v)), status: changed && filled ? (state === "owner_submitted" ? "owner_original" : "reviewed") : before.status ?? "draft" };
  }
  await sql.begin(async (tx) => {
    await tx`update wineries set
      content = ${tx.json(content)}, website = ${orNull(e.website)}, email = ${orNull(e.email)}, phone = ${orNull(e.phone)},
      whatsapp = ${orNull(e.whatsapp)}, instagram = ${orNull(e.instagram)}, facebook = ${orNull(e.facebook)}, youtube = ${orNull(e.youtube)},
      opening_hours = ${e.opening_hours.hr || e.opening_hours.en ? tx.json(e.opening_hours) : null},
      appointment_only = ${e.appointment_only}, languages = ${pgArrayLiteral(e.languages)}::text[],
      founded_year = ${e.founded_year}, founder = ${orNull(e.founder)}, owner_name = ${orNull(e.owner_name)}, winemaker_name = ${orNull(e.winemaker_name)},
      family_run = ${e.family_run}, size_category = ${e.size_category},
      verification = case when verification in ('unverified','third_party_sourced') and ${state} = 'owner_submitted' then 'owner_submitted'::verification_state else verification end,
      updated_at = now()
      where id = ${wineryId}`;
    const grapeRows = e.grapes.length ? await tx<{ id: number; slug: string }[]>`select id, slug from grape_varieties where slug in ${tx(e.grapes.map((g) => g.slug))}` : [];
    await tx`delete from winery_grape_varieties where winery_id = ${wineryId}`;
    for (const g of e.grapes) {
      const id = grapeRows.find((r) => r.slug === g.slug)?.id;
      if (id) await tx`insert into winery_grape_varieties (winery_id, grape_id, relation, is_signature, verification) values (${wineryId}, ${id}, ${g.relation}, ${g.is_signature}, ${state})`;
    }
    // Facilities: keep third-party rows the owner did not touch; owner list becomes authoritative.
    await tx`delete from winery_facilities where winery_id = ${wineryId} and facility <> all(${pgArrayLiteral(e.facilities.length ? e.facilities : ["__none__"])}::text[])`;
    for (const f of e.facilities) {
      await tx`insert into winery_facilities (winery_id, facility, verification) values (${wineryId}, ${f}, ${state})
        on conflict (winery_id, facility) do update set verification = excluded.verification`;
    }
  });
  await sql`select refresh_winery_search(${wineryId})`;
  await audit(actorId, "winery.update", "winery", wineryId, { state });
}

/** Profile completeness (0–100) with actionable recommendations. Not a measure of verification. */
export async function completeness(wineryId: number) {
  const [w] = await sql<{
    content: Record<string, Record<string, string>>; website: string | null; email: string | null; phone: string | null;
    opening_hours: unknown; appointment_only: boolean | null; languages: string[]; precise: boolean; wines: number; experiences: number;
    photos: number; grapes: number;
  }[]>`
    select w.content, w.website, w.email, w.phone, w.opening_hours, w.appointment_only, w.languages,
      exists (select 1 from winery_locations l where l.winery_id = w.id and l.is_primary and l.precision in ('exact','address')) as precise,
      (select count(*)::int from wines where winery_id = w.id) as wines,
      (select count(*)::int from tasting_experiences where winery_id = w.id and is_active) as experiences,
      (select count(*)::int from media where winery_id = w.id and status = 'approved' and kind in ('hero','gallery','tasting_room')) as photos,
      (select count(*)::int from winery_grape_varieties where winery_id = w.id) as grapes
    from wineries w where w.id = ${wineryId}`;
  const checks: [string, boolean, number][] = [
    ["croatian", !!w.content?.hr?.description || !!w.content?.hr?.short, 10],
    ["english", !!w.content?.en?.description || !!w.content?.en?.short, 10],
    ["description", !!(w.content?.hr?.description && w.content?.en?.description), 10],
    ["story", !!(w.content?.hr?.story || w.content?.en?.story), 8],
    ["website", !!w.website, 8],
    ["email", !!w.email, 8],
    ["phone", !!w.phone, 5],
    ["exactLocation", w.precise, 8],
    ["hours", !!w.opening_hours || w.appointment_only != null, 5],
    ["languages", w.languages.length > 0, 4],
    ["grapes", w.grapes > 0, 6],
    ["wines", w.wines > 0, 8],
    ["experiences", w.experiences > 0, 5],
    ["photos", w.photos > 0, 5],
  ];
  const total = checks.reduce((a, c) => a + c[2], 0);
  const score = checks.reduce((a, c) => a + (c[1] ? c[2] : 0), 0);
  return { percent: Math.round((score / total) * 100), missing: checks.filter((c) => !c[1]).map((c) => c[0]) };
}
