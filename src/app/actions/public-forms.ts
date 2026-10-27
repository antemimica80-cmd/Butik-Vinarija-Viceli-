"use server";

import { sql } from "@/lib/db";
import { claimSchema, contactSchema, reportSchema } from "@/lib/schemas";
import { checkFormToken, clientIpHash } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { getCurrentUser } from "@/lib/auth";

type Result = { ok: true } | { ok: false; error: "validation" | "rate_limit" | "expired" | "generic"; fields?: string[] };

async function guard(formToken: string, key: string, limit: number): Promise<Result | null> {
  const tok = checkFormToken(formToken, 1500);
  if (tok !== "ok") return { ok: false, error: "expired" };
  const ip = await clientIpHash();
  if (!(await rateLimit(`${key}:${ip}`, limit, 3600))) return { ok: false, error: "rate_limit" };
  return null;
}

function form(fd: FormData) {
  return Object.fromEntries([...fd.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]));
}

export async function submitReport(_: Result | null, fd: FormData): Promise<Result> {
  const raw = form(fd);
  const p = reportSchema.safeParse({ ...raw, wineryId: Number(raw.wineryId) });
  if (!p.success) return { ok: false, error: "validation", fields: p.error.issues.map((i) => String(i.path[0])) };
  if (p.data.website) return { ok: true };
  const g = await guard(p.data.formToken, "report", 10);
  if (g) return g;
  await sql`insert into data_reports (winery_id, entity_type, field, message, reporter_email)
    values (${p.data.wineryId}, 'winery', ${p.data.field}, ${p.data.message}, ${p.data.email || null})`;
  return { ok: true };
}

export async function submitClaim(_: Result | null, fd: FormData): Promise<Result> {
  const raw = form(fd);
  const p = claimSchema.safeParse({ ...raw, wineryId: raw.wineryId ? Number(raw.wineryId) : null });
  if (!p.success) return { ok: false, error: "validation", fields: p.error.issues.map((i) => String(i.path[0])) };
  if (p.data.website) return { ok: true };
  const g = await guard(p.data.formToken, "claim", 5);
  if (g) return g;
  if (p.data.wineryId) {
    const [w] = await sql`select id from wineries where id = ${p.data.wineryId} and status = 'published'`;
    if (!w) return { ok: false, error: "validation", fields: ["wineryId"] };
  }
  const user = await getCurrentUser();
  const [row] = await sql<{ id: string }[]>`
    insert into ownership_claims (winery_id, proposed_winery_name, user_id, claimant_name, claimant_email, claimant_phone, position, evidence)
    values (${p.data.wineryId}, ${p.data.proposedName || null}, ${user?.id ?? null}, ${p.data.name}, ${p.data.email},
            ${p.data.phone || null}, ${p.data.position || null}, ${p.data.evidence})
    returning id`;
  if (process.env.EDITORIAL_EMAIL) {
    await sendEmail({
      to: process.env.EDITORIAL_EMAIL, kind: "claim",
      subject: `${p.data.wineryId ? "Ownership claim" : "Listing request"}: ${p.data.proposedName || `winery #${p.data.wineryId}`}`,
      text: `Claim ${row.id}\nName: ${p.data.name}\nEmail: ${p.data.email}\nRole: ${p.data.position || "-"}\n\nEvidence:\n${p.data.evidence}`,
    });
  }
  return { ok: true };
}

export async function submitContact(_: Result | null, fd: FormData): Promise<Result> {
  const p = contactSchema.safeParse(form(fd));
  if (!p.success) return { ok: false, error: "validation", fields: p.error.issues.map((i) => String(i.path[0])) };
  if (p.data.website) return { ok: true };
  const g = await guard(p.data.formToken, "contact", 5);
  if (g) return g;
  const to = process.env.EDITORIAL_EMAIL;
  // Messages are always stored in the outbox; without a recipient they wait for an administrator.
  await sendEmail({
    to: to || "(EDITORIAL_EMAIL not configured)", kind: "contact",
    subject: `Contact: ${p.data.subject || "(no subject)"}`,
    text: `From: ${p.data.name} <${p.data.email}>\n\n${p.data.message}`,
  });
  return { ok: true };
}
