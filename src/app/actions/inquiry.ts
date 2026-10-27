"use server";

import { randomBytes } from "node:crypto";
import { sql } from "@/lib/db";
import { inquirySchema, type InquiryInput } from "@/lib/schemas";
import { checkFormToken, clientIpHash } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

export type InquiryResult =
  | { ok: true; ref: string; email: "sent" | "queued" | "no_provider" | "failed"; duplicate?: boolean }
  | { ok: false; error: "validation" | "rate_limit" | "duplicate" | "too_fast" | "expired" | "generic"; fields?: Record<string, string> };

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeRef() {
  const b = randomBytes(6);
  return "CWA-" + Array.from(b, (x) => REF_ALPHABET[x % REF_ALPHABET.length]).join("");
}

export async function submitInquiry(raw: InquiryInput, locale: "hr" | "en"): Promise<InquiryResult> {
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0])] = i.message;
    return { ok: false, error: "validation", fields };
  }
  const d = parsed.data;

  // Bots that fill the hidden field get a neutral response and nothing is stored.
  if (d.website) return { ok: true, ref: makeRef(), email: "queued" };

  const token = checkFormToken(d.formToken);
  if (token === "too_fast") return { ok: false, error: "too_fast" };
  if (token !== "ok") return { ok: false, error: "expired" };

  if (d.preferredDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (d.preferredDate < today) return { ok: false, error: "validation", fields: { preferredDate: "date" } };
  }

  // Idempotent: the same submission (e.g. a double click or retry) returns the original reference.
  const [existing] = await sql<{ public_ref: string }[]>`select public_ref from tasting_inquiries where idempotency_key = ${d.idempotencyKey}`;
  if (existing) return { ok: true, ref: existing.public_ref, email: "queued", duplicate: true };

  const ip = await clientIpHash();
  if (!(await rateLimit(`inquiry:ip:${ip}`, 6, 3600))) return { ok: false, error: "rate_limit" };
  if (!(await rateLimit(`inquiry:email:${d.email.toLowerCase()}`, 10, 86400))) return { ok: false, error: "rate_limit" };

  const [winery] = await sql<{ id: number; name: string; slug: string; email: string | null }[]>`
    select id, name, slug, email from wineries where id = ${d.wineryId} and status = 'published'`;
  if (!winery) return { ok: false, error: "generic" };
  let experienceName: string | null = null;
  if (d.experienceId) {
    const [e] = await sql<{ name: { hr?: string; en?: string } }[]>`select name from tasting_experiences where id = ${d.experienceId} and winery_id = ${winery.id} and is_active`;
    if (!e) return { ok: false, error: "validation", fields: { experienceId: "generic" } };
    experienceName = e.name[locale] ?? e.name.hr ?? e.name.en ?? null;
  }

  // Near-identical request from the same person in the last 10 minutes → treat as duplicate.
  const [recent] = await sql<{ public_ref: string }[]>`
    select public_ref from tasting_inquiries
    where lower(email) = lower(${d.email}) and winery_id = ${winery.id}
      and coalesce(preferred_date::text, '') = ${d.preferredDate} and created_at > now() - interval '10 minutes'`;
  if (recent) return { ok: false, error: "duplicate" };

  const ref = makeRef();
  const [row] = await sql<{ id: string }[]>`
    insert into tasting_inquiries (public_ref, winery_id, experience_id, preferred_date, preferred_time, flexible_schedule,
      adults, children, language, full_name, email, phone, country, message, locale, consent_privacy_at, consent_marketing,
      idempotency_key, ip_hash)
    values (${ref}, ${winery.id}, ${d.experienceId}, ${d.preferredDate || null}, ${d.preferredTime}, ${d.flexible},
      ${d.adults}, ${d.children}, ${d.language || null}, ${d.fullName}, ${d.email}, ${d.phone || null}, ${d.country || null},
      ${d.message || null}, ${locale}, now(), ${d.marketing}, ${d.idempotencyKey}, ${ip})
    on conflict (idempotency_key) do nothing
    returning id`;
  if (!row) return { ok: true, ref, email: "queued", duplicate: true };
  await sql`insert into inquiry_events (inquiry_id, kind, data) values (${row.id}, 'created', ${sql.json({ locale })})`;

  const when = d.preferredDate ? `${d.preferredDate}${d.preferredTime !== "any" ? ` (${d.preferredTime})` : ""}` : "flexible";
  const guests = `${d.adults} adult(s)${d.children ? `, ${d.children} child(ren)` : ""}`;

  // Visitor acknowledgement (never claims a confirmed booking).
  const ack = await sendEmail({
    to: d.email,
    kind: "inquiry_ack",
    inquiryId: row.id,
    subject: locale === "hr" ? `Upit zaprimljen: ${winery.name} (${ref})` : `Request received: ${winery.name} (${ref})`,
    text: locale === "hr"
      ? `Poštovani/a ${d.fullName},\n\nvaš upit za degustaciju u vinariji ${winery.name} je zaprimljen (oznaka ${ref}).\nTraženi termin: ${when}. Gosti: ${guests}.\n\nOvo NIJE potvrđena rezervacija. Vinarija će vam se javiti radi potvrde.\n\nAtlas hrvatskih vinarija\n${SITE_URL}`
      : `Dear ${d.fullName},\n\nyour tasting request for ${winery.name} has been received (reference ${ref}).\nRequested: ${when}. Guests: ${guests}.\n\nThis is NOT a confirmed booking. The winery will contact you to confirm.\n\nCroatian Wine Atlas\n${SITE_URL}`,
  });
  await sql`insert into inquiry_events (inquiry_id, kind, data) values (${row.id}, ${ack.status === "sent" ? "email_sent" : "email_" + ack.status}, ${sql.json({ to: "visitor", outbox: ack.id })})`;

  // Winery notification — or the editorial desk when no public address is on file.
  const target = winery.email || process.env.EDITORIAL_EMAIL || null;
  if (target) {
    const n = await sendEmail({
      to: target,
      kind: winery.email ? "inquiry_winery" : "inquiry_editorial",
      inquiryId: row.id,
      subject: `New tasting request ${ref} — ${winery.name}`,
      text: `${winery.email ? "" : "[No public winery email on file — please forward]\n\n"}Winery: ${winery.name}\nReference: ${ref}\nExperience: ${experienceName ?? "general visit"}\nRequested: ${when}\nGuests: ${guests}\nLanguage: ${d.language || "-"}\nName: ${d.fullName}\nEmail: ${d.email}\nPhone: ${d.phone || "-"}\nCountry: ${d.country || "-"}\n\nMessage:\n${d.message || "-"}\n\nManage requests: ${SITE_URL}/en/owner/${winery.slug}/inquiries`,
    });
    await sql`insert into inquiry_events (inquiry_id, kind, data) values (${row.id}, ${n.status === "sent" ? "email_sent" : "email_" + n.status}, ${sql.json({ to: winery.email ? "winery" : "editorial", outbox: n.id })})`;
  } else {
    await sql`insert into inquiry_events (inquiry_id, kind, data) values (${row.id}, 'note', ${sql.json({ message: "No winery or editorial email configured; visible in admin queue" })})`;
  }

  return { ok: true, ref, email: ack.status === "sent" ? "sent" : ack.status === "failed" ? "failed" : "no_provider" };
}
