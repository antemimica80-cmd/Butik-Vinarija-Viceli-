import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Landscape, regionVariant } from "@/components/Landscape";
import { Breadcrumbs, DraftNotice, RegionDot, SectionHeading, JsonLd } from "@/components/ui";
import { WineryGrid } from "@/components/WineryGrid";
import { RegionMap } from "@/components/RegionMap";
import { Icon } from "@/components/Icon";
import { getRegion, getSubregions, getDistricts, getGrapes, getArticles } from "@/lib/queries/catalog";
import { searchWineries } from "@/lib/queries/wineries";
import { pick, field, grapeName } from "@/lib/content";
import { pageMetadata, localizedPath } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale; region: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, region } = await params;
  const r = await getRegion(region);
  if (!r) return {};
  return pageMetadata({ title: pick(r.name, locale), description: field(r.content, "intro", locale).text.slice(0, 200), href: { pathname: "/regions/[region]", params: { region } }, locale });
}

export default async function RegionPage({ params }: Props) {
  const { locale, region } = await params;
  setRequestLocale(locale);
  const r = await getRegion(region);
  if (!r) notFound();
  const [t, tc, nav, ts, subs, districts, grapes, featured, all, articles] = await Promise.all([
    getTranslations("regions"), getTranslations("common"), getTranslations("nav"), getTranslations("stories"),
    getSubregions(r.id), getDistricts(), getGrapes(), searchWineries({ region: [r.slug], featured: true }, { pageSize: 3 }),
    searchWineries({ region: [r.slug] }, { pageSize: 12 }), getArticles({ related: { key: "regions", slug: r.slug }, limit: 3 }),
  ]);
  const name = pick(r.name, locale);
  const regionGrapes = grapes.filter((g) => g.regions.some((x) => x.slug === r.slug)).sort((a, b) => (a.origin === "indigenous" ? -1 : 1) - (b.origin === "indigenous" ? -1 : 1));
  const href = { pathname: "/regions/[region]" as const, params: { region } };
  const intro = field(r.content, "intro", locale);
  const facts = (["climate", "soil", "varieties", "styles"] as const).map((k) => ({ k, f: field(r.content, k, locale) })).filter((x) => x.f.text);

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Place", name, url: `${SITE_URL}${localizedPath(href, locale)}`, containedInPlace: { "@type": "Country", name: "Croatia" }, description: intro.text }} />
      <header className="relative isolate overflow-hidden bg-forest text-ivory">
        <Landscape variant={regionVariant(r.slug)} seed={r.sort + 2} className="absolute inset-0 -z-10 h-full w-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
        <div className="container-x pb-14 pt-10 md:pb-20">
          <Breadcrumbs light items={[{ label: nav("regions"), href: "/regions", url: localizedPath("/regions", locale) }, { label: name, url: localizedPath(href, locale) }]} />
          <p className="eyebrow eyebrow-light mt-28 flex items-center gap-2 md:mt-40"><RegionDot color={r.color} /> {tc("wineriesCount", { count: r.winery_count })}</p>
          <h1 className="mt-3 text-5xl md:text-8xl">{name}</h1>
          <p className="mt-4 max-w-2xl font-display text-2xl text-ivory/90">{field(r.content, "tagline", locale).text}</p>
        </div>
      </header>

      <div className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="eyebrow">{t("intro_label")}</h2>
            <p className="mt-3 text-xl leading-relaxed">{intro.text}</p>
            <DraftNotice status={intro.status} fallback={intro.fallback} />
            <dl className="mt-10 grid gap-6 sm:grid-cols-2">
              {facts.map(({ k, f }) => (
                <div key={k} className="card p-5">
                  <dt className="font-display text-2xl text-forest">{t(k)}</dt>
                  <dd className="mt-2 text-[0.95rem] leading-relaxed text-stone-700">{f.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <aside className="space-y-6">
            <div className="card p-6">
              <h2 className="font-display text-2xl">{t("subregions")}</h2>
              <ul className="mt-3 divide-y divide-line">
                {subs.map((s) => (
                  <li key={s.slug}>
                    <Link href={{ pathname: "/regions/[region]/[subregion]", params: { region: r.slug, subregion: s.slug } }} className="flex items-center justify-between py-3 hover:text-forest">
                      <span>{pick(s.name, locale)}</span><span className="text-sm text-stone-700">{s.winery_count} <Icon name="chevronRight" size={14} className="inline" /></span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-stone-700">{t("officialName")}: {r.official_name}{r.source_url && <> · <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="underline">{r.source_name}</a></>}</p>
            </div>
            {districts.some((d) => d.region_slug === r.slug) && (
              <div className="card p-6">
                <h2 className="font-display text-2xl">{t("districts")}</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {districts.filter((d) => d.region_slug === r.slug).map((d) => <li key={d.slug}><Link href={{ pathname: "/districts/[slug]", params: { slug: d.slug } }} className="chip hover:border-forest">{pick(d.name, locale)}</Link></li>)}
                </ul>
                <p className="mt-3 text-xs text-stone-700">{t("districtNote")}</p>
              </div>
            )}
            <div className="card p-6">
              <h2 className="font-display text-2xl">{t("grapesTitle", { region: name })}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {regionGrapes.map((g) => <li key={g.slug}><Link href={{ pathname: "/grapes/[slug]", params: { slug: g.slug } }} className={`chip hover:border-forest ${g.origin === "indigenous" ? "chip-wine" : ""}`}>{grapeName(g, locale)}</Link></li>)}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <section className="container-x pb-16" aria-labelledby="map-h">
        <h2 id="map-h" className="mb-6 text-4xl text-forest">{t("mapTitle", { region: name })}</h2>
        <div className="h-[28rem] overflow-hidden rounded-[1.6rem] border border-line"><RegionMap query={`region=${r.slug}`} /></div>
        <p className="mt-3 text-xs text-stone-700">{t("boundaryNote")}</p>
      </section>

      {featured.items.length > 0 && (
        <section className="container-x pb-16">
          <SectionHeading title={t("featuredTitle", { region: name })} />
          <WineryGrid items={featured.items} />
        </section>
      )}

      <section className="bg-paper py-16">
        <div className="container-x">
          <SectionHeading title={t("wineriesTitle", { region: name })} action={<Link href={{ pathname: "/wineries", query: { region: r.slug } }} className="btn btn-primary">{t("allWineries", { region: name })} <Icon name="arrowRight" size={16} /></Link>} />
          <WineryGrid items={all.items} cols={4} />
        </div>
      </section>

      {articles.length > 0 && (
        <section className="container-x py-16">
          <SectionHeading title={t("storiesTitle")} />
          <ul className="grid gap-4 md:grid-cols-3">
            {articles.map((a) => (
              <li key={a.id} className="card p-6">
                <p className="eyebrow">{ts(`category.${a.category as "regions"}`)}</p>
                <Link href={{ pathname: "/stories/[slug]", params: { slug: a.slug } }} className="mt-2 block font-display text-2xl hover:text-forest">{field(a.content, "title", locale).text}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
