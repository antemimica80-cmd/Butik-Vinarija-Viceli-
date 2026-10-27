import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/ContentPage";
import { Breadcrumbs, DraftNotice, Fact, LevelMeter, RegionDot, SectionHeading, JsonLd } from "@/components/ui";
import { WineryGrid } from "@/components/WineryGrid";
import { Icon } from "@/components/Icon";
import { getGrape, searchWines } from "@/lib/queries/catalog";
import { searchWineries } from "@/lib/queries/wineries";
import { field, grapeName, pick } from "@/lib/content";
import { pageMetadata, localizedPath } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const g = await getGrape(slug);
  if (!g) return {};
  return pageMetadata({ title: grapeName(g, locale), description: field(g.content, "summary", locale).text.slice(0, 200), href: { pathname: "/grapes/[slug]", params: { slug } }, locale, type: "article" });
}

export default async function GrapePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const g = await getGrape(slug);
  if (!g) notFound();
  const [t, nav, tw, wineries, wines] = await Promise.all([
    getTranslations("grapes"), getTranslations("nav"), getTranslations("wineType"),
    searchWineries({ grape: [g.slug] }, { pageSize: 9 }), searchWines({ grape: [g.slug] }, 24),
  ]);
  const name = grapeName(g, locale);
  const summary = field(g.content, "summary", locale);
  const blocks = (["style", "aroma", "pairing"] as const).map((k) => ({ k, f: field(g.content, k, locale) })).filter((b) => b.f.text);
  const variant = g.regions[0]?.slug === "dalmacija" ? "dalmatia" : g.regions[0]?.slug === "hrvatska-istra-i-kvarner" ? "istria" : g.regions[0]?.slug === "slavonija-i-hrvatsko-podunavlje" ? "slavonia" : "uplands";
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "DefinedTerm", name, alternateName: g.synonyms, description: summary.text, url: `${SITE_URL}${localizedPath({ pathname: "/grapes/[slug]", params: { slug } }, locale)}`, inDefinedTermSet: `${SITE_URL}${localizedPath("/grapes", locale)}` }} />
      <PageHero title={name} eyebrow={`${t(`color.${g.berry_color as "white"}`)} · ${t(`origin.${g.origin as "indigenous"}`)}`} variant={variant}>
        <Breadcrumbs light items={[{ label: nav("grapes"), href: "/grapes", url: localizedPath("/grapes", locale) }, { label: name }]} />
      </PageHero>
      <div className="container-x grid gap-12 py-14 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="font-display text-3xl leading-snug text-forest">{summary.text}</p>
          <DraftNotice status={summary.status} fallback={summary.fallback} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {blocks.map(({ k, f }) => (
              <div key={k} className="card p-5"><h2 className="font-display text-2xl">{t(k)}</h2><p className="mt-2 text-[0.95rem] leading-relaxed text-stone-700">{f.text}</p></div>
            ))}
          </div>
        </div>
        <aside className="card self-start p-6">
          <dl>
            {locale === "en" && g.name_hr !== g.name_en && <Fact label="Croatian name">{g.name_hr}</Fact>}
            {g.synonyms.length > 0 && <Fact label={t("synonyms")}>{g.synonyms.join(", ")}</Fact>}
            {g.parentage && <Fact label={t("parentage")}>{g.parentage}</Fact>}
            <Fact label={t("regions")}>
              <span className="flex flex-col gap-1">{g.regions.map((r) => <Link key={r.slug} href={{ pathname: "/regions/[region]", params: { region: r.slug } }} className="flex items-center gap-2 hover:underline"><RegionDot color={r.color} />{pick(r.name, locale)}</Link>)}</span>
            </Fact>
          </dl>
          <div className="mt-4 space-y-3">
            <LevelMeter value={g.acidity} label={t("acidity")} />
            <LevelMeter value={g.tannin} label={t("tannin")} />
          </div>
        </aside>
      </div>
      <section className="container-x pb-14">
        <SectionHeading title={t("wineriesTitle", { grape: name })} action={wineries.total > 9 ? <Link href={{ pathname: "/wineries", query: { grape: g.slug } }} className="btn btn-primary">{t("wineries", { count: wineries.total })} <Icon name="arrowRight" size={16} /></Link> : undefined} />
        {wineries.items.length ? <WineryGrid items={wineries.items} /> : <p className="text-stone-700">{t("wineriesEmpty")}</p>}
      </section>
      <section className="bg-paper py-14">
        <div className="container-x">
          <SectionHeading title={t("winesTitle", { grape: name })} />
          {wines.items.length ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {wines.items.map((w) => (
                <li key={w.id}>
                  <Link href={{ pathname: "/wines/[slug]", params: { slug: w.slug } }} className="flex items-center gap-3 rounded-2xl border border-line bg-ivory p-4 hover:border-forest">
                    <RegionDot color={w.region_color} />
                    <span className="min-w-0"><span className="block truncate font-medium">{w.name}</span><span className="block truncate text-xs text-stone-700">{w.winery_name} · {tw(w.type as "red")}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="text-stone-700">{t("winesEmpty")}</p>}
        </div>
      </section>
    </>
  );
}
