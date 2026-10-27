import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/ContentPage";
import { Breadcrumbs, EmptyState, RegionDot } from "@/components/ui";
import { Pagination } from "@/components/Pagination";
import { Icon } from "@/components/Icon";
import { searchAwards, getCompetitions } from "@/lib/queries/catalog";
import { MEDALS } from "@/lib/constants";
import { pageMetadata, localizedPath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "awards" });
  return pageMetadata({ title: t("metaTitle"), description: t("metaDescription"), href: "/awards", locale, noindex: Object.keys(sp).length > 0 });
}

export default async function AwardsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const competition = sp.competition && /^[a-z0-9-]+$/.test(sp.competition) ? [sp.competition] : undefined;
  const medal = MEDALS.includes(sp.medal as never) ? [sp.medal!] : undefined;
  const year = Number(sp.year) >= 1950 && Number(sp.year) <= 2100 ? Number(sp.year) : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const [t, tm, nav, ts, comps, result] = await Promise.all([
    getTranslations("awards"), getTranslations("medal"), getTranslations("nav"), getTranslations("search"), getCompetitions(),
    searchAwards({ competition, medal, year, q: sp.q?.slice(0, 100), page }),
  ]);
  const query = Object.fromEntries(Object.entries({ competition: sp.competition, medal: sp.medal, year: sp.year, q: sp.q }).filter(([, v]) => v)) as Record<string, string>;
  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} variant="slavonia">
        <Breadcrumbs light items={[{ label: nav("awards"), url: localizedPath("/awards", locale) }]} />
      </PageHero>
      <div className="container-x py-12">
        <p className="mb-8 flex max-w-3xl items-start gap-2 rounded-2xl bg-brass-100 p-4 text-sm text-brass-700"><Icon name="shield" size={18} className="mt-0.5 shrink-0" /> {t("policy")}</p>
        <form role="search" className="grid gap-3 md:grid-cols-[1fr_16rem_12rem_9rem_auto]">
          <input name="q" defaultValue={sp.q} placeholder={`${t("wine")} / ${t("winery")}`} className="field" aria-label={`${t("wine")} / ${t("winery")}`} />
          <select name="competition" defaultValue={sp.competition ?? ""} className="field" aria-label={t("competition")}>
            <option value="">{t("competition")}</option>
            {comps.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <select name="medal" defaultValue={sp.medal ?? ""} className="field" aria-label={t("medal")}>
            <option value="">{t("medal")}</option>
            {MEDALS.map((m) => <option key={m} value={m}>{tm(m)}</option>)}
          </select>
          <input name="year" type="number" min={1950} max={2100} defaultValue={sp.year} placeholder={t("year")} className="field" aria-label={t("year")} />
          <button className="btn btn-primary"><Icon name="search" size={16} /> {ts("submit")}</button>
        </form>

        {result.items.length ? (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-paper">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wider text-stone-700"><tr><th className="p-4">{t("medal")}</th><th className="p-4">{t("wine")}</th><th className="p-4">{t("winery")}</th><th className="p-4">{t("competition")}</th><th className="p-4">{t("year")}</th><th className="p-4" /></tr></thead>
              <tbody className="divide-y divide-line">
                {result.items.map((a) => (
                  <tr key={a.id}>
                    <td className="p-4 font-medium"><span className="flex items-center gap-2"><Icon name="medal" size={16} className="text-brass-700" />{tm(a.medal as "gold")}{a.score ? ` · ${a.score}` : ""}</span></td>
                    <td className="p-4"><Link href={{ pathname: "/wines/[slug]", params: { slug: a.wine_slug } }} className="underline decoration-line underline-offset-4 hover:decoration-forest">{a.wine_name}</Link>{a.vintage_year ? ` ${a.vintage_year}` : ""}</td>
                    <td className="p-4"><Link href={{ pathname: "/wineries/[slug]", params: { slug: a.winery_slug } }} className="flex items-center gap-2 hover:underline"><RegionDot color={a.region_color} />{a.winery_name}</Link></td>
                    <td className="p-4">{a.competition_name}</td>
                    <td className="p-4 tabular-nums">{a.year}</td>
                    <td className="p-4">{a.source_url && <a href={a.source_url} target="_blank" rel="noopener noreferrer nofollow" className="text-forest underline"><Icon name="external" size={14} /></a>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="mt-8"><EmptyState icon="medal" title={t("empty")} body={t("emptyBody")} /></div>}
        <Pagination pathname="/awards" query={query} page={page} pages={Math.ceil(result.total / result.pageSize)} />

        <h2 className="mt-16 text-3xl text-forest">{t("competitions")}</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {comps.map((c) => (
            <li key={c.slug} className="card flex items-center justify-between gap-3 p-4">
              <span><span className="block font-medium">{c.name}</span><span className="text-xs text-stone-700">{c.award_count}</span></span>
              {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-forest" aria-label={c.name}><Icon name="external" size={16} /></a>}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
