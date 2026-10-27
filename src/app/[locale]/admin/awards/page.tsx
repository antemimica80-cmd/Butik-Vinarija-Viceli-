import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell, Table } from "@/components/admin/AdminShell";
import { ActionForm } from "@/components/forms/ActionForm";
import { pageStaff } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import { createAward, setAwardVerification, deleteAward } from "@/app/actions/admin";
import { MEDALS, VERIFICATION_STATES } from "@/lib/constants";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Awards" };

export default async function AdminAwards({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/awards`);
  const [awards, wines, comps] = await Promise.all([
    sql<{ id: number; year: number; medal: string; score: string | null; verification: string; source_url: string | null; vintage_year: number | null; wine: string; winery: string; competition: string; notes: string | null }[]>`
      select a.id, a.year, a.medal, a.score, a.verification, a.source_url, coalesce(v.year, a.vintage_year) as vintage_year, wi.name as wine, w.name as winery, c.short_name as competition, a.notes
      from wine_awards a join wines wi on wi.id = a.wine_id join wineries w on w.id = a.winery_id join competitions c on c.id = a.competition_id
      left join wine_vintages v on v.id = a.vintage_id order by (a.verification in ('editor_verified','officially_verified')), a.created_at desc limit 500`,
    sql<{ id: number; label: string }[]>`select wi.id, w.name || ' — ' || wi.name as label from wines wi join wineries w on w.id = wi.winery_id where wi.status = 'published' order by w.name, wi.name`,
    sql<{ slug: string; name: string }[]>`select slug, name from competitions order by sort`,
  ]);
  return (
    <AdminShell user={user} active="awards" title="Awards">
      <section className="card mb-8 p-6">
        <h2 className="font-display text-2xl">Record an award from official results</h2>
        <p className="mt-1 text-sm text-stone-700">Attach each award to exactly one wine and vintage. Use the competition&apos;s own results page as the source. Respect competition logo and trademark rules — medal names only, no logos unless licensed.</p>
        <ActionForm action={createAward} submitLabel="Save award" messages={{ published: "Award saved.", error: "Check fields:", pending: "Saving…" }} className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="field-label md:col-span-2">Wine<select name="wineId" required className="field mt-1">{wines.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}</select></label>
          <label className="field-label">Competition<select name="competition" className="field mt-1">{comps.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
          <label className="field-label">Competition year<input name="year" type="number" required min={1950} max={2100} className="field mt-1" /></label>
          <label className="field-label">Vintage<input name="vintage" type="number" min={1900} max={2100} className="field mt-1" /></label>
          <label className="field-label">Medal<select name="medal" className="field mt-1">{MEDALS.map((m) => <option key={m} value={m}>{m}</option>)}</select></label>
          <label className="field-label">Medal label (as published)<input name="medalLabel" className="field mt-1" /></label>
          <label className="field-label">Score<input name="score" type="number" step="0.1" min={0} max={100} className="field mt-1" /></label>
          <label className="field-label">Category<input name="category" className="field mt-1" /></label>
          <label className="field-label md:col-span-2">Official results URL<input name="sourceUrl" type="url" required className="field mt-1" /></label>
          <label className="field-label">Verification<select name="verification" defaultValue="officially_verified" className="field mt-1">{VERIFICATION_STATES.map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
        </ActionForm>
      </section>
      <Table head={["Wine", "Competition", "Medal", "Vintage", "State", "Source", ""]}>
        {awards.map((a) => (
          <tr key={a.id}>
            <td className="p-3">{a.winery} — {a.wine}</td>
            <td className="p-3">{a.competition} {a.year}</td>
            <td className="p-3">{a.medal}{a.score ? ` (${a.score})` : ""}</td>
            <td className="p-3">{a.vintage_year ?? "NV"}</td>
            <td className="p-3"><span className={`chip ${a.verification.includes("verified") && a.verification !== "unverified" ? "chip-forest" : "chip-wine"}`}>{a.verification}</span>{a.notes && <span className="block text-xs text-stone-700">{a.notes}</span>}</td>
            <td className="p-3">{a.source_url && <a href={a.source_url} target="_blank" rel="noopener noreferrer" className="underline">link</a>}</td>
            <td className="p-3">
              <form action={setAwardVerification} className="flex gap-1"><input type="hidden" name="id" value={a.id} />
                <button name="state" value="officially_verified" className="btn btn-primary btn-sm !min-h-7 !px-2 !text-xs">Verify</button>
                <button name="state" value="unverified" className="btn btn-ghost btn-sm !min-h-7 !px-2 !text-xs">Unverify</button></form>
              <form action={deleteAward} className="mt-1"><input type="hidden" name="id" value={a.id} /><button className="text-xs text-burgundy underline">delete</button></form>
            </td>
          </tr>
        ))}
      </Table>
    </AdminShell>
  );
}
