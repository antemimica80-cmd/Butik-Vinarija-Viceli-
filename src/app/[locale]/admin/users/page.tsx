import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell, Table } from "@/components/admin/AdminShell";
import { pageStaff } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import { setUserRole, setUserDisabled } from "@/app/actions/admin";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Users" };

export default async function AdminUsers({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/users`, true);
  const rows = await sql<{ id: string; email: string; name: string | null; role: string; created_at: string; last_login_at: string | null; disabled_at: string | null; wineries: string | null }[]>`
    select u.id, u.email, u.name, u.role, u.created_at, u.last_login_at, u.disabled_at,
      (select string_agg(w.name, ', ') from winery_owners o join wineries w on w.id = o.winery_id where o.user_id = u.id) as wineries
    from users u order by u.created_at desc limit 500`;
  return (
    <AdminShell user={user} active="users" title={`Users (${rows.length})`}>
      <Table head={["User", "Role", "Wineries", "Last login", "Status"]}>
        {rows.map((u) => (
          <tr key={u.id}>
            <td className="p-3">{u.name}<span className="block text-xs text-stone-700">{u.email}</span></td>
            <td className="p-3">
              <form action={setUserRole} className="flex gap-1"><input type="hidden" name="id" value={u.id} />
                <select name="role" defaultValue={u.role} className="field !min-h-8 !w-28 !py-0.5 text-xs" aria-label="Role" disabled={u.id === user.id}>{["visitor", "owner", "editor", "admin"].map((r) => <option key={r}>{r}</option>)}</select>
                {u.id !== user.id && <button className="btn btn-ghost btn-sm !min-h-8 !text-xs">Set</button>}</form>
            </td>
            <td className="p-3 text-xs">{u.wineries ?? "—"}</td>
            <td className="p-3 text-xs">{u.last_login_at?.slice(0, 10) ?? "—"}</td>
            <td className="p-3">
              {u.id !== user.id && (
                <form action={setUserDisabled}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="disabled" value={u.disabled_at ? "0" : "1"} />
                  <button className={`text-xs underline ${u.disabled_at ? "text-forest" : "text-burgundy"}`}>{u.disabled_at ? "Enable" : "Disable"}</button></form>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </AdminShell>
  );
}
