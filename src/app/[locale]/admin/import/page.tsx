import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell, Table } from "@/components/admin/AdminShell";
import { ImportForm } from "@/components/admin/ImportForm";
import { pageStaff } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Import" };

export default async function AdminImport({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/import`);
  const jobs = await sql<{ id: number; filename: string | null; dry_run: boolean; status: string; total_rows: number; created_rows: number; updated_rows: number; skipped_rows: number; created_at: string; email: string | null }[]>`
    select j.id, j.filename, j.dry_run, j.status, j.total_rows, j.created_rows, j.updated_rows, j.skipped_rows, j.created_at, u.email
    from data_import_jobs j left join users u on u.id = j.created_by order by j.created_at desc limit 50`;
  return (
    <AdminShell user={user} active="import" title="Bulk import" actions={<a href="/templates/wineries-import-template.csv" className="btn btn-ghost btn-sm">Download template</a>}>
      <p className="mb-6 max-w-3xl text-sm text-stone-700">
        Every row needs a source. Rows are validated individually; existing wineries are updated only on an exact slug match. Possible duplicates
        (same name, same website domain, or similar name within 2 km) are skipped and reported — merge them manually. Always run a dry run first.
        Respect the source&apos;s licence and terms: do not import scraped or restricted registry data.
      </p>
      <ImportForm />
      <h2 className="mb-3 mt-10 text-xl">Import history</h2>
      <Table head={["#", "File", "Mode", "Rows", "Created", "Updated", "Skipped/errors", "By", "When"]}>
        {jobs.map((j) => (
          <tr key={j.id}><td className="p-3">{j.id}</td><td className="p-3">{j.filename}</td><td className="p-3">{j.dry_run ? "dry run" : "commit"}</td><td className="p-3">{j.total_rows}</td>
            <td className="p-3">{j.created_rows}</td><td className="p-3">{j.updated_rows}</td><td className="p-3">{j.skipped_rows}</td><td className="p-3 text-xs">{j.email}</td><td className="p-3 text-xs">{j.created_at.slice?.(0, 16) ?? String(j.created_at)}</td></tr>
        ))}
      </Table>
    </AdminShell>
  );
}
