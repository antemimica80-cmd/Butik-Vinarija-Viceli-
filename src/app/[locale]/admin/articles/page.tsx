import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell, Table } from "@/components/admin/AdminShell";
import { Link } from "@/i18n/navigation";
import { pageStaff } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import type { LocalizedContent } from "@/lib/content";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Articles" };

export default async function AdminArticles({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/articles`);
  const rows = await sql<{ id: number; slug: string; category: string; status: string; content: LocalizedContent; updated_at: Date }[]>`
    select id, slug, category, status, content, updated_at from editorial_articles order by updated_at desc`;
  return (
    <AdminShell user={user} active="articles" title="Editorial articles" actions={<Link href={{ pathname: "/admin/articles/[id]", params: { id: "new" } }} className="btn btn-primary btn-sm">+ New article</Link>}>
      <p className="mb-4 max-w-3xl text-sm text-stone-700">Articles need cited sources and a factual review before they are marked as reviewed. Do not publish generic or machine-written text.</p>
      <Table head={["Title", "Category", "Status", "HR / EN", "Updated"]}>
        {rows.map((a) => (
          <tr key={a.id}>
            <td className="p-3"><Link href={{ pathname: "/admin/articles/[id]", params: { id: String(a.id) } }} className="text-forest underline">{a.content?.en?.title || a.content?.hr?.title || a.slug}</Link></td>
            <td className="p-3">{a.category}</td><td className="p-3">{a.status}</td>
            <td className="p-3 text-xs">{a.content?.hr?.status ?? "—"} / {a.content?.en?.status ?? "—"}</td>
            <td className="p-3 text-xs">{new Date(a.updated_at).toISOString().slice(0, 10)}</td>
          </tr>
        ))}
      </Table>
    </AdminShell>
  );
}
