import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Landscape, regionVariant } from "@/components/Landscape";
import { SearchBox } from "@/components/SearchBox";
import { WineryCard } from "@/components/WineryCard";
import { AtlasPreview } from "@/components/map/AtlasPreview";
import { SectionHeading, RegionDot, JsonLd } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { featuredWineries } from "@/lib/queries/wineries";
import { getRegions, getGrapes, getArticles, searchExperiences } from "@/lib/queries/catalog";
import { pick, field, grapeName } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return pageMetadata({ title: t("metaTitle"), description: t("metaDescription"), href: "/", locale });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, tg, ts, tk, tw, tcard, regions, featured, grapes, articles, experiences] = await Promise.all([
    getTranslations("home"), getTranslations("common"), getTranslations("grapes"), getTranslations("stories"),
    getTranslations("experienceKind"), getTranslations("winery"), getTranslations("wineries.card"),
    getRegions(), featuredWineries(6), getGrapes({ featured: true }), getArticles({ limit: 3 }), searchExperiences({}),
  ]);
  const total = regions.reduce((a, r) => a + r.winery_count, 0);
  const allGrapes = await getGrapes();
  const grapesByRegion = (regionSlug: string) => allGrapes.filter((g) => g.origin !== "international" && g.regions.some((r) => r.slug === regionSlug)).slice(0, 4);

  const shortcuts = [
    { href: { pathname: "/map" as const }, icon: "map" as const, label: t("shortcutMap") },
    { href: { pathname: "/map" as const, query: { locate: "1" } }, icon: "locate" as const, label: t("shortcutNear") },
    { href: { pathname: "/wineries" as const, query: { facility: "tasting" } }, icon: "glass" as const, label: t("shortcutTastings") },
    { href: { pathname: "/awards" as const }, icon: "medal" as const, label: t("shortcutAwards") },
    { href: { pathname: "/regions" as const }, icon: "layers" as const, label: t("shortcutRegions") },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "WebSite", name: tc("siteName"), url: `${SITE_URL}/${locale}`, inLanguage: locale,
        potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/${locale}/${locale === "hr" ? "vinarije" : "wineries"}?q={search_term_string}`, "query-input": "required name=search_term_string" },
      }} />

      {/* A. Hero */}
      <section className="relative isolate flex min-h-[94svh] items-end overflow-hidden bg-forest-900 pb-14 pt-32 text-ivory md:items-center md:pb-24">
        <Landscape variant="hero" seed={11} className="absolute inset-0 -z-10 h-full w-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-900/95 via-forest-900/70 to-forest-900/50 md:from-forest-900/90 md:via-forest-900/35 md:to-forest-900/30" />
        <div className="container-x">
          <div className="max-w-3xl fade-up">
            <p className="eyebrow eyebrow-light mb-5">{t("heroEyebrow")}</p>
            <h1 className="text-[3.1rem] leading-[0.98] sm:text-7xl md:text-[5.6rem]">{t("heroTitle")}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory/85 md:text-xl">{t("heroIntro")}</p>
          </div>
          <div className="mt-10 max-w-3xl fade-up" style={{ animationDelay: "120ms" }}>
            <SearchBox size="hero" placeholder={t("searchPlaceholder")} />
            <nav aria-label={t("shortcutsLabel")} className="mt-5 flex flex-wrap gap-2">
              {shortcuts.map((s) => (
                <Link key={s.label} href={s.href} className="btn btn-sm btn-outline-light backdrop-blur-sm">
                  <Icon name={s.icon} size={16} /> {s.label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="mt-10 text-xs text-ivory/60">
            {t("coverageNote", { count: total })} <Link href="/coverage" className="underline underline-offset-4 hover:text-ivory">{t("coverageLink")}</Link>
          </p>
        </div>
      </section>

      {/* B. Atlas preview */}
      <section className="container-x py-20 md:py-28" aria-labelledby="atlas-title">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow mb-3">{t("atlasEyebrow")}</p>
            <h2 id="atlas-title" className="text-4xl text-forest md:text-6xl">{t("atlasTitle")}</h2>
            <p className="mt-5 text-lg leading-relaxed text-stone-700">{t("atlasIntro")}</p>
            <ul className="mt-8 space-y-3">
              {regions.map((r) => (
                <li key={r.slug}>
                  <Link href={{ pathname: "/map", query: { region: r.slug } }} className="group flex items-center justify-between rounded-2xl border border-line bg-paper px-4 py-3 transition-colors hover:border-forest">
                    <span className="flex items-center gap-3"><RegionDot color={r.color} className="h-3 w-3" /> <span className="font-medium">{pick(r.name, locale)}</span></span>
                    <span className="flex items-center gap-2 text-sm text-stone-700">{tc("wineriesCount", { count: r.winery_count })}<Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-0.5" /></span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/map" className="btn btn-primary mt-8"><Icon name="map" size={18} /> {t("atlasCta")}</Link>
          </div>
          <div className="h-[26rem] overflow-hidden rounded-[1.6rem] border border-line shadow-lift md:h-[34rem]"><AtlasPreview /></div>
        </div>
      </section>

      {/* C. Regions */}
      <section className="bg-paper py-20 md:py-28" aria-labelledby="regions-title">
        <div className="container-x">
          <SectionHeading id="regions-title" eyebrow={t("regionsEyebrow")} title={t("regionsTitle")} intro={t("regionsIntro")}
            action={<Link href="/regions" className="btn btn-ghost">{tc("viewAll")} <Icon name="arrowRight" size={16} /></Link>} />
          <div className="grid gap-6 md:grid-cols-2">
            {regions.map((r, i) => (
              <article key={r.slug} className="group relative overflow-hidden rounded-[1.6rem] bg-forest text-ivory">
                <Landscape variant={regionVariant(r.slug)} seed={i + 3} className="absolute inset-0 h-full w-full transition-transform duration-[1.2s] group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="relative flex min-h-[25rem] flex-col justify-end p-7 md:min-h-[30rem] md:p-9">
                  <p className="eyebrow eyebrow-light">{tc("wineriesCount", { count: r.winery_count })}</p>
                  <h3 className="mt-2 text-4xl md:text-5xl">
                    <Link href={{ pathname: "/regions/[region]", params: { region: r.slug } }} className="after:absolute after:inset-0">{pick(r.name, locale)}</Link>
                  </h3>
                  <p className="mt-3 max-w-lg text-[0.98rem] leading-relaxed text-ivory/85">{field(r.content, "tagline", locale).text}</p>
                  <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-ivory/70">{t("keyVarieties")}</p>
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    {grapesByRegion(r.slug).map((g) => <span key={g.slug} className="rounded-full bg-ivory/15 px-3 py-1 text-sm backdrop-blur-sm">{grapeName(g, locale)}</span>)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* D. Featured wineries */}
      <section className="container-x py-20 md:py-28" aria-labelledby="featured-title">
        <SectionHeading id="featured-title" eyebrow={t("featuredEyebrow")} title={t("featuredTitle")} intro={t("featuredIntro")}
          action={<Link href="/wineries" className="btn btn-ghost">{tc("viewAll")} <Icon name="arrowRight" size={16} /></Link>} />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((w) => <li key={w.id}><WineryCard w={w} variant="feature" /></li>)}
        </ul>
      </section>

      {/* E. Grapes */}
      <section className="relative overflow-hidden bg-forest py-20 text-ivory md:py-28" aria-labelledby="grapes-title">
        <div className="topo-bg absolute inset-0 opacity-50" aria-hidden />
        <div className="container-x relative">
          <SectionHeading light id="grapes-title" eyebrow={t("grapesEyebrow")} title={t("grapesTitle")} intro={t("grapesIntro")}
            action={<Link href="/grapes" className="btn btn-outline-light">{tc("viewAll")} <Icon name="arrowRight" size={16} /></Link>} />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {grapes.map((g) => (
              <li key={g.slug}>
                <Link href={{ pathname: "/grapes/[slug]", params: { slug: g.slug } }}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-ivory/15 bg-ivory/[0.04] p-4 transition-colors hover:border-brass hover:bg-ivory/[0.08]">
                  <span className="mb-6 flex gap-1" aria-hidden>
                    {[0, 1, 2].map((i) => <span key={i} className="h-3 w-3 rounded-full" style={{ background: g.berry_color === "red" ? "#792E39" : g.berry_color === "grey" ? "#B88A8E" : "#C9B26A", opacity: 1 - i * 0.25 }} />)}
                  </span>
                  <span>
                    <span className="block font-display text-2xl leading-tight">{grapeName(g, locale)}</span>
                    <span className="mt-1 block text-xs text-ivory/65">{tg(`color.${g.berry_color as "white"}`)} · {tg("wineries", { count: g.winery_count })}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* F. Experiences */}
      <section className="container-x py-20 md:py-28" aria-labelledby="exp-title">
        <SectionHeading id="exp-title" eyebrow={t("experiencesEyebrow")} title={t("experiencesTitle")} intro={t("experiencesIntro")}
          action={<Link href="/experiences" className="btn btn-ghost">{tc("viewAll")} <Icon name="arrowRight" size={16} /></Link>} />
        {experiences.length ? (
          <ul className="grid gap-5 md:grid-cols-3">
            {experiences.slice(0, 3).map((e) => (
              <li key={e.id} className="card flex flex-col p-6">
                <p className="eyebrow flex items-center gap-2"><RegionDot color={e.region_color} /> {tk(e.kind as "tasting")}</p>
                <h3 className="mt-3 font-display text-2xl leading-tight">{pick(e.name, locale)}</h3>
                <p className="mt-2 text-sm text-stone-700">{e.winery_name}{e.town ? ` · ${e.town}` : ""}</p>
                <div className="mt-auto flex gap-2 pt-5">
                  <Link href={{ pathname: "/wineries/[slug]/inquiry", params: { slug: e.winery_slug }, query: { experience: String(e.id) } }} className="btn btn-wine btn-sm">{tw("requestTasting")}</Link>
                  <Link href={{ pathname: "/wineries/[slug]", params: { slug: e.winery_slug } }} className="btn btn-ghost btn-sm">{tcard("viewProfile")}</Link>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="text-stone-700">{t("experiencesEmpty")}</p>}
      </section>

      {/* G. Stories */}
      {articles.length > 0 && (
        <section className="bg-paper py-20 md:py-28" aria-labelledby="stories-title">
          <div className="container-x">
            <SectionHeading id="stories-title" eyebrow={t("storiesEyebrow")} title={t("storiesTitle")} intro={t("storiesIntro")}
              action={<Link href="/stories" className="btn btn-ghost">{tc("viewAll")} <Icon name="arrowRight" size={16} /></Link>} />
            <ul className="grid gap-6 md:grid-cols-3">
              {articles.map((a, i) => (
                <li key={a.id}>
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-line bg-ivory">
                    <div className="aspect-[16/10] overflow-hidden"><Landscape variant={(["dalmatia", "istria", "uplands"] as const)[i % 3]} seed={20 + i} className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]" /></div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="eyebrow">{ts(`category.${a.category as "regions"}`)}</p>
                      <h3 className="mt-2 font-display text-2xl leading-tight">
                        <Link href={{ pathname: "/stories/[slug]", params: { slug: a.slug } }} className="after:absolute after:inset-0">{field(a.content, "title", locale).text}</Link>
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone-700">{field(a.content, "excerpt", locale).text}</p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* H. Final */}
      <section className="container-x pt-20 md:pt-28">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-burgundy px-7 py-16 text-ivory md:px-16 md:py-24">
          <Landscape variant="dalmatia" seed={5} className="absolute inset-0 -z-10 h-full w-full opacity-60" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-burgundy via-burgundy/80 to-transparent" />
          <h2 className="max-w-xl text-4xl md:text-6xl">{t("finalTitle")}</h2>
          <p className="mt-5 max-w-lg text-lg text-ivory/85">{t("finalIntro")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/map" className="btn btn-light"><Icon name="map" size={18} /> {t("finalCtaMap")}</Link>
            <Link href="/routes/planner" className="btn btn-outline-light"><Icon name="route" size={18} /> {t("finalCtaRoute")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
