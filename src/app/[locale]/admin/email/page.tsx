import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell, Table } from "@/components/admin/AdminShell";
import { pageStaff } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import { retryEmails } from "@/app/actions/admin";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Email outbox" };

export default async function AdminEmail({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/email`);
  const rows = await sql<{ id: number; to_email: string; subject: string; kind: string; status: string; error: string | null; attempts: number; created_at: Date; text_body: string }[]>`
    select id, to_email, subject, kind, status, error, attempts, created_at, text_body from email_outbox order by created_at desc limit 200`;
  const configured = !!process.env.RESEND_API_KEY;
  return (
    <AdminShell user={user} active="email" title="Email outbox"
      actions={<form action={retryEmails}><button className="btn btn-primary btn-sm">Retry undelivered</button></form>}>
      <p className={`mb-4 rounded-xl p-3 text-sm ${configured ? "bg-forest-100 text-forest" : "bg-brass-100 text-brass-700"}`}>
        {configured ? "Resend is configured. Failed messages can be retried." : "No email provider configured (RESEND_API_KEY). Messages are stored here with status “no_provider” and are not delivered."}
        {!process.env.EDITORIAL_EMAIL && " EDITORIAL_EMAIL is not set: inquiries for wineries without a public email are only visible in Admin › Inquiries."}
      </p>
      <Table head={["When", "To", "Kind", "Subject", "Status", "Attempts"]}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="p-3 text-xs">{new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}</td>
            <td className="p-3 text-xs">{r.to_email}</td><td className="p-3 text-xs">{r.kind}</td>
            <td className="p-3"><details><summary className="cursor-pointer">{r.subject}</summary><pre className="mt-2 whitespace-pre-wrap text-xs">{r.text_body}</pre></details></td>
            <td className="p-3"><span className={`chip ${r.status === "sent" ? "chip-forest" : "chip-wine"}`}>{r.status}</span>{r.error && <span className="block text-xs text-burgundy">{r.error}</span>}</td>
            <td className="p-3">{r.attempts}</td>
          </tr>
        ))}
      </Table>
    </AdminShell>
  );
}
