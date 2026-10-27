import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell, Table } from "@/components/admin/AdminShell";
import { pageStaff } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Audit log" };

export default async function AdminAudit({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/audit`);
  const rows = await sql<{ id: number; action: string; entity_type: string; entity_id: string | null; diff: unknown; created_at: Date; email: string | null }[]>`
    select a.id, a.action, a.entity_type, a.entity_id, a.diff, a.created_at, u.email from audit_log a left join users u on u.id = a.actor_user_id
    order by a.created_at desc limit 300`;
  return (
    <AdminShell user={user} active="audit" title="Audit log">
      <Table head={["When", "Who", "Action", "Entity", "Details"]}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="p-3 text-xs">{new Date(r.created_at).toISOString().slice(0, 19).replace("T", " ")}</td>
            <td className="p-3 text-xs">{r.email ?? "system"}</td>
            <td className="p-3 font-mono text-xs">{r.action}</td>
            <td className="p-3 text-xs">{r.entity_type} {r.entity_id}</td>
            <td className="p-3 font-mono text-xs">{r.diff ? JSON.stringify(r.diff).slice(0, 160) : ""}</td>
          </tr>
        ))}
      </Table>
    </AdminShell>
  );
}
