import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { ActionForm } from "@/components/forms/ActionForm";
import { pageStaff } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import { saveArticle } from "@/app/actions/admin";
import type { LocalizedContent } from "@/lib/content";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Edit article" };
const CATS = ["regions", "grapes", "winemakers", "education", "travel", "experiences", "awards", "heritage", "history", "gastronomy", "methodology"];

export default async function EditArticle({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/articles/${id}`);
  const isNew = id === "new";
  const [a] = isNew ? [null] : await sql<{ id: number; slug: string; category: string; status: string; author_name: string | null; content: LocalizedContent; sources: { label: string; url: string }[] }[]>`
    select id, slug, category, status, author_name, content, sources from editorial_articles where id = ${Number(id) || 0}`;
  if (!isNew && !a) notFound();
  return (
    <AdminShell user={user} active="articles" title={isNew ? "New article" : a!.content?.en?.title || a!.slug}>
      <ActionForm action={saveArticle} submitLabel="Save article" messages={{ published: "Saved.", error: "Check fields:", pending: "Saving…" }} className="space-y-6">
        <input type="hidden" name="locale" value={locale} />
        {a && <input type="hidden" name="id" value={a.id} />}
        <div className="card grid gap-3 p-6 md:grid-cols-4">
          <label className="field-label">Slug<input name="slug" required pattern="[a-z0-9-]+" defaultValue={a?.slug} className="field mt-1" /></label>
          <label className="field-label">Category<select name="category" defaultValue={a?.category ?? "regions"} className="field mt-1">{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="field-label">Status<select name="status" defaultValue={a?.status ?? "draft"} className="field mt-1"><option>draft</option><option>published</option><option>archived</option></select></label>
          <label className="field-label">Author<input name="author" defaultValue={a?.author_name ?? ""} className="field mt-1" /></label>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {(["hr", "en"] as const).map((l) => (
            <div key={l} className="card space-y-3 p-6" lang={l}>
              <p className="eyebrow">{l === "hr" ? "Hrvatski" : "English"}</p>
              <label className="field-label">Title<input name={`${l}.title`} defaultValue={a?.content?.[l]?.title ?? ""} className="field mt-1" /></label>
              <label className="field-label">Excerpt<textarea name={`${l}.excerpt`} defaultValue={a?.content?.[l]?.excerpt ?? ""} className="field mt-1 !min-h-16" /></label>
              <label className="field-label">Body (Markdown: ## headings, - lists, **bold**, [links](https://…))<textarea name={`${l}.body`} defaultValue={a?.content?.[l]?.body ?? ""} className="field mt-1 !min-h-80 font-mono text-sm" /></label>
              <label className="field-label">Content status<select name={`${l}.status`} defaultValue={a?.content?.[l]?.status ?? "draft"} className="field mt-1"><option value="draft">draft (shows review notice)</option><option value="reviewed">fact-checked</option></select></label>
            </div>
          ))}
        </div>
        <label className="card field-label block p-6">Sources (one per line: <code>Label | https://url</code>)
          <textarea name="sources" defaultValue={(a?.sources ?? []).map((s) => `${s.label} | ${s.url}`).join("\n")} className="field mt-2 !min-h-24 font-mono text-sm" />
        </label>
      </ActionForm>
    </AdminShell>
  );
}
