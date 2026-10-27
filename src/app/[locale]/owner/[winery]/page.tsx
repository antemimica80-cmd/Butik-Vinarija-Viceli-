import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { Icon } from "@/components/Icon";
import { pageWineryManager } from "@/lib/page-auth";
import { wineryForOwner } from "@/lib/queries/owner";
import { completeness } from "@/lib/winery-mutations";
import { sql } from "@/lib/db";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false } };

export default async function OwnerDashboard({ params }: { params: Promise<{ locale: Locale; winery: string }> }) {
  const { locale, winery } = await params;
  setRequestLocale(locale);
  const w = await wineryForOwner(winery);
  if (!w) notFound();
  await pageWineryManager(locale, w.id, `/${locale}/${locale === "hr" ? "vlasnik" : "owner"}/${winery}`);
  const [t, comp, [stats]] = await Promise.all([
    getTranslations("owner"), completeness(w.id),
    sql<{ new: number; total30: number; pending: number }[]>`
      select (select count(*)::int from tasting_inquiries where winery_id = ${w.id} and status = 'new') as new,
             (select count(*)::int from tasting_inquiries where winery_id = ${w.id} and created_at > now() - interval '30 days') as total30,
             (select count(*)::int from change_requests where winery_id = ${w.id} and status = 'pending') as pending`,
  ]);
  const recHref = (k: string) => (["wines"].includes(k) ? "/owner/[winery]/wines" : k === "experiences" ? "/owner/[winery]/experiences" : k === "photos" ? "/owner/[winery]/media" : "/owner/[winery]/profile") as "/owner/[winery]/profile";
  return (
    <OwnerShell winery={w} active="dashboard">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="card p-6">
          <h2 className="font-display text-3xl">{t("completeness", { percent: comp.percent })}</h2>
          <div className="mt-4 h-3 rounded-full bg-line" role="progressbar" aria-valuenow={comp.percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-3 rounded-full bg-forest transition-all" style={{ width: `${comp.percent}%` }} />
          </div>
          <p className="mt-3 text-xs text-stone-700">{t("completenessNote")}</p>
          {comp.missing.length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-medium">{t("recommendations")}</h3>
              <ul className="mt-2 space-y-1.5">
                {comp.missing.map((k) => (
                  <li key={k}><Link href={{ pathname: recHref(k), params: { winery } }} className="flex items-center gap-2 text-sm hover:text-forest"><Icon name="plus" size={14} className="text-burgundy" />{t(`rec.${k as "story"}`)}</Link></li>
                ))}
              </ul>
            </>
          )}
        </section>
        <section className="space-y-4">
          <div className="card p-6">
            <p className="eyebrow">{t("stats")}</p>
            <p className="mt-3 font-display text-4xl text-forest">{stats.total30}</p>
            <p className="text-sm text-stone-700">{t("inquiriesTotal")}</p>
            <Link href={{ pathname: "/owner/[winery]/inquiries", params: { winery } }} className="btn btn-wine btn-sm mt-4"><Icon name="inbox" size={15} /> {t("newInquiries", { count: stats.new })}</Link>
          </div>
          {stats.pending > 0 && <p className="rounded-2xl bg-brass-100 p-4 text-sm text-brass-700">{t("pendingChanges", { count: stats.pending })}</p>}
          <p className="text-xs text-stone-700">{t("reviewNote")}</p>
        </section>
      </div>
    </OwnerShell>
  );
}
