import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Link } from "@/i18n/navigation";
import { pageStaff } from "@/lib/page-auth";
import { qualityLists } from "@/lib/queries/quality";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Data quality" };

function Block({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <details className="card" open={count > 0 && count < 20}>
      <summary className="flex cursor-pointer list-none justify-between p-4 font-medium [&::-webkit-details-marker]:hidden"><span>{title}</span><span className={`chip ${count ? "chip-wine" : "chip-forest"}`}>{count}</span></summary>
      <div className="border-t border-line p-4 text-sm">{children}</div>
    </details>
  );
}

export default async function QualityPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/quality`);
  const l = await qualityLists();
  const edit = (id: number, name: string) => <Link href={{ pathname: "/admin/wineries/[id]", params: { id: String(id) } }} className="text-forest underline">{name}</Link>;
  return (
    <AdminShell user={user} active="quality" title="Data quality">
      <div className="space-y-3">
        <Block title="Possible duplicates (name similarity > 0.6) — review manually, never auto-merge" count={l.duplicates.length}>
          <ul className="space-y-1">{l.duplicates.map((d) => <li key={`${d.a_id}-${d.b_id}`}>{edit(d.a_id, d.a)} ↔ {edit(d.b_id, d.b)} <span className="text-stone-700">({d.sim})</span></li>)}</ul>
        </Block>
        <Block title="Unverified records" count={l.unverified.length}><p className="leading-7">{l.unverified.map((w, i) => <span key={w.id}>{i > 0 && " · "}{edit(w.id, w.name)}</span>)}</p></Block>
        <Block title="Approximate / settlement-level locations (geocode from a verified address)" count={l.approximate.length}>
          <ul className="columns-1 gap-6 md:columns-2">{l.approximate.map((w) => <li key={w.id}>{edit(w.id, w.name)} <span className="text-stone-700">— {w.town} ({w.precision})</span></li>)}</ul>
        </Block>
        <Block title="Missing website" count={l.missingWebsite.length}><p className="leading-7">{l.missingWebsite.map((w, i) => <span key={w.id}>{i > 0 && " · "}{edit(w.id, w.name)}</span>)}</p></Block>
        <Block title="Missing translation of short description" count={l.translations.length}><p className="leading-7">{l.translations.map((w, i) => <span key={w.id}>{i > 0 && " · "}{edit(w.id, w.name)} ({w.missing})</span>)}</p></Block>
        <Block title="Malformed website URLs" count={l.invalidUrls.length}><ul>{l.invalidUrls.map((w) => <li key={w.id}>{edit(w.id, w.name)} — {w.website}</li>)}</ul></Block>
      </div>
      <p className="mt-6 text-xs text-stone-700">Broken-link detection requires outbound HTTP: run <code>npm run links:check</code> on a machine with internet access.</p>
    </AdminShell>
  );
}
