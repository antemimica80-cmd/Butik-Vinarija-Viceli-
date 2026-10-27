import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { AccountShell } from "@/components/account/AccountShell";
import { EmptyState, RegionDot } from "@/components/ui";
import { Landscape, regionVariant } from "@/components/Landscape";
import { Link } from "@/i18n/navigation";
import { pageUser } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import { pick, type LocalizedText } from "@/lib/content";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false } };

/** Private "wine passport": a stamp collection of visited wineries. */
export default async function PassportPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageUser(locale, `/${locale}/${locale === "hr" ? "racun/putovnica" : "account/passport"}`);
  const [t, fmt] = await Promise.all([getTranslations("account"), getFormatter()]);
  const visits = await sql<{ slug: string; name: string; visited_on: string | null; region_slug: string | null; region_name: LocalizedText; color: string | null; id: number }[]>`
    select w.id, w.slug, w.name, v.visited_on, r.slug as region_slug, r.name as region_name, r.color
    from winery_visits v join wineries w on w.id = v.winery_id left join wine_regions r on r.id = w.region_id
    where v.user_id = ${user.id} order by v.visited_on desc nulls last`;
  const regions = await sql<{ slug: string; name: LocalizedText; color: string }[]>`select slug, name, color from wine_regions order by sort`;
  return (
    <AccountShell user={user} active="passport">
      <h1 className="text-5xl text-forest">{t("passport")}</h1>
      <p className="mt-3 max-w-xl text-stone-700">{t("passportIntro")}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {regions.map((r) => {
          const n = visits.filter((v) => v.region_slug === r.slug).length;
          return <span key={r.slug} className="chip"><RegionDot color={r.color} /> {pick(r.name, locale)} · {n}</span>;
        })}
      </div>
      {visits.length ? (
        <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
          {visits.map((v) => (
            <li key={v.slug}>
              <Link href={{ pathname: "/wineries/[slug]", params: { slug: v.slug } }} className="group block text-center">
                <span className="relative mx-auto block aspect-square w-full max-w-[11rem] overflow-hidden rounded-full border-4 border-double" style={{ borderColor: v.color ?? "#193C34" }}>
                  <Landscape variant={regionVariant(v.region_slug)} seed={v.id} className="h-full w-full" />
                  <span className="absolute inset-0 grid place-items-center bg-black/25 p-3 font-display text-xl leading-tight text-ivory">{v.name}</span>
                </span>
                {v.visited_on && <span className="mt-2 block text-xs text-stone-700">{t("visitedOn", { date: fmt.dateTime(new Date(v.visited_on), { day: "numeric", month: "short", year: "numeric" }) })}</span>}
              </Link>
            </li>
          ))}
        </ul>
      ) : <div className="mt-8"><EmptyState icon="flag" title={t("passportEmpty")} /></div>}
    </AccountShell>
  );
}
