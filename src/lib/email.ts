import "server-only";
import { sql } from "./db";

type Outgoing = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  kind: string;
  inquiryId?: string | null;
};

export type DeliveryResult = { id: number; status: "sent" | "failed" | "no_provider" };

/**
 * Store an email in the outbox, then try to deliver it.
 * Without RESEND_API_KEY the message stays in the outbox with status "no_provider" —
 * we never report delivery that did not happen.
 */
export async function sendEmail(msg: Outgoing): Promise<DeliveryResult> {
  const [row] = await sql<{ id: number }[]>`
    insert into email_outbox (to_email, subject, text_body, html_body, kind, inquiry_id)
    values (${msg.to}, ${msg.subject}, ${msg.text}, ${msg.html ?? null}, ${msg.kind}, ${msg.inquiryId ?? null})
    returning id`;
  return deliver(row.id);
}

export async function deliver(id: number): Promise<DeliveryResult> {
  const [m] = await sql`select * from email_outbox where id = ${id}`;
  const key = process.env.RESEND_API_KEY;
  if (!key || !String(m.to_email).includes("@")) {
    await sql`update email_outbox set status = 'no_provider', attempts = attempts + 1 where id = ${id}`;
    return { id, status: "no_provider" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Croatian Wine Atlas <no-reply@example.com>",
        to: [m.to_email],
        subject: m.subject,
        text: m.text_body,
        html: m.html_body ?? undefined,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) throw new Error(body.message || `HTTP ${res.status}`);
    await sql`update email_outbox set status = 'sent', provider = 'resend', provider_id = ${body.id ?? null},
      attempts = attempts + 1, sent_at = now(), error = null where id = ${id}`;
    return { id, status: "sent" };
  } catch (e) {
    await sql`update email_outbox set status = 'failed', provider = 'resend', attempts = attempts + 1,
      error = ${String((e as Error).message).slice(0, 500)} where id = ${id}`;
    return { id, status: "failed" };
  }
}

/** Retry queued / failed / provider-less emails (run from cron via `npm run email:flush`). */
export async function flushOutbox(limit = 50) {
  const rows = await sql<{ id: number }[]>`
    select id from email_outbox where status in ('queued','failed','no_provider') and attempts < 5
    order by created_at limit ${limit}`;
  const results: DeliveryResult[] = [];
  for (const r of rows) results.push(await deliver(r.id));
  return results;
}
