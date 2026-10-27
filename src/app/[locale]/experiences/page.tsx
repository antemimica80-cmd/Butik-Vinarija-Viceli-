import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/ContentPage";
import { Breadcrumbs, EmptyState, RegionDot, SectionHeading } from "@/components/ui";
import { WineryGrid } from "@/components/WineryGrid";
import { searchExperiences, getRegions } from "@/lib/queries/catalog";
import { searchWineries } from "@/lib/queries/wineries";
import { EXPERIENCE_KINDS } from "@/lib/constants";
import { pick } from "@/lib/content";
import { pageMetadata, localizedPath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ kind?: string; region?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "experiences" });
  return pageMetadata({ title: t("metaTitle"), description: t("metaDescription"), href: "/experiences", locale, noindex: !!(sp.kind || sp.region) });
}

export default async function ExperiencesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const kind = EXPERIENCE_KINDS.includes(sp.kind as never) ? [sp.kind!] : undefined;
  const region = sp.region && /^[a-z0-9-]+$/.test(sp.region) ? [sp.region] : undefined;
  const [t, tk, tw, nav, regions, items, tastings] = await Promise.all([
    getTranslations("experiences"), getTranslations("experienceKind"), getTranslations("winery"), getTranslations("nav"), getRegions(),
    searchExperiences({ kind, region }), searchWineries({ facility: ["tasting"], region }, { pageSize: 6 }),
  ]);
  const chip = (active: boolean) => `chip ${active ? "!bg-forest !text-ivory !border-forest" : "hover:border-stone"}`;
  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} variant="uplands">
        <Breadcrumbs light items={[{ label: nav("experiences"), url: localizedPath("/experiences", locale) }]} />
      </PageHero>
      <div className="container-x py-12">
        <nav className="flex flex-wrap gap-2" aria-label={t("allKinds")}>
          <Link href={{ pathname: "/experiences", query: sp.region ? { region: sp.region } : {} }} className={chip(!kind)}>{t("allKinds")}</Link>
          {EXPERIENCE_KINDS.filter((k) => k !== "other").map((k) => <Link key={k} href={{ pathname: "/experiences", query: { ...(sp.region ? { region: sp.region } : {}), kind: k } }} className={chip(kind?.[0] === k)}>{tk(k)}</Link>)}
        </nav>
        <nav className="mt-3 flex flex-wrap gap-2" aria-label={nav("regions")}>
          {regions.map((r) => <Link key={r.slug} href={{ pathname: "/experiences", query: { ...(sp.kind ? { kind: sp.kind } : {}), ...(region?.[0] === r.slug ? {} : { region: r.slug }) } }} className={chip(region?.[0] === r.slug)}><RegionDot color={r.color} /> {pick(r.name, locale)}</Link>)}
        </nav>
        {items.length ? (
          <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => (
              <li key={e.id} className="card flex flex-col p-6">
                <p className="eyebrow flex items-center gap-2"><RegionDot color={e.region_color} /> {tk(e.kind as "tasting")}</p>
                <h2 className="mt-3 font-display text-2xl leading-tight">{pick(e.name, locale)}</h2>
                <p className="mt-1 text-sm text-stone-700">{e.winery_name}{e.town ? ` · ${e.town}` : ""} · {pick(e.region_name, locale)}</p>
                {pick(e.description, locale) && <p className="mt-3 text-sm leading-relaxed">{pick(e.description, locale)}</p>}
                <p className="mt-3 flex flex-wrap gap-2 text-xs">
                  {e.duration_min != null && <span className="chip">{tw("experienceDetails.duration", { minutes: e.duration_min })}</span>}
                  {e.price_eur != null ? <span className="chip chip-brass">{tw("experienceDetails.price", { price: e.price_eur })}</span> : <span className="chip">{tw("experienceDetails.priceUnknown")}</span>}
                </p>
                {e.source_name && <p className="mt-3 text-[0.7rem] text-stone-700">{t("sourceNote", { source: e.source_name })}</p>}
                <div className="mt-auto flex gap-2 pt-5">
                  <Link href={{ pathname: "/wineries/[slug]/inquiry", params: { slug: e.winery_slug }, query: { experience: String(e.id) } }} className="btn btn-wine btn-sm">{t("request")}</Link>
                  <Link href={{ pathname: "/wineries/[slug]", params: { slug: e.winery_slug } }} className="btn btn-ghost btn-sm">{e.winery_name}</Link>
                </div>
              </li>
            ))}
          </ul>
        ) : <div className="mt-8"><EmptyState icon="glass" title={t("empty")} /></div>}
        {tastings.items.length > 0 && (
          <section className="mt-16">
            <SectionHeading title={t("alsoTastings")} />
            <WineryGrid items={tastings.items} />
          </section>
        )}
      </div>
    </>
  );
}
