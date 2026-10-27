/** Retry undelivered email (run from cron, e.g. every 10 minutes): npm run email:flush */
import "./env";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
(async () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.log("RESEND_API_KEY not set — nothing delivered."); return; }
  const rows = await sql<{ id: number; to_email: string; subject: string; text_body: string; html_body: string | null }[]>`
    select id, to_email, subject, text_body, html_body from email_outbox where status in ('queued','failed','no_provider') and attempts < 5 and to_email like '%@%' order by created_at limit 100`;
  for (const m of rows) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [m.to_email], subject: m.subject, text: m.text_body, html: m.html_body ?? undefined }),
      });
      const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!res.ok) throw new Error(body.message ?? `HTTP ${res.status}`);
      await sql`update email_outbox set status = 'sent', provider = 'resend', provider_id = ${body.id ?? null}, attempts = attempts + 1, sent_at = now(), error = null where id = ${m.id}`;
    } catch (e) {
      await sql`update email_outbox set status = 'failed', attempts = attempts + 1, error = ${String((e as Error).message).slice(0, 500)} where id = ${m.id}`;
    }
  }
  console.log(`Processed ${rows.length} message(s).`);
})().finally(() => sql.end());
