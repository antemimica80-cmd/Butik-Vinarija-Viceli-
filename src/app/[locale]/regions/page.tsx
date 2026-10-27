import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/ContentPage";
import { Landscape, regionVariant } from "@/components/Landscape";
import { Breadcrumbs, RegionDot } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { getRegions, getSubregions, getDistricts } from "@/lib/queries/catalog";
import { pick, field } from "@/lib/content";
import { pageMetadata, localizedPath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "regions" });
  return pageMetadata({ title: t("metaTitle"), description: t("metaDescription"), href: "/regions", locale });
}

export default async function RegionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, nav, regions, subs, districts] = await Promise.all([getTranslations("regions"), getTranslations("common"), getTranslations("nav"), getRegions(), getSubregions(), getDistricts()]);
  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} variant="dalmatia">
        <Breadcrumbs light items={[{ label: nav("regions"), url: localizedPath("/regions", locale) }]} />
      </PageHero>
      <div className="container-x py-14">
        <div className="card topo-bg mb-14 p-6 md:p-8">
          <h2 className="text-3xl text-forest">{t("hierarchyTitle")}</h2>
          <p className="mt-2 max-w-3xl text-stone-700">{t("hierarchy")}</p>
          {regions[0]?.source_url && <p className="mt-3 text-xs text-stone-700">{t("legalBasis")}: <a href={regions[0].source_url} target="_blank" rel="noopener noreferrer" className="underline">{regions[0].source_name}</a></p>}
        </div>
        <div className="space-y-16">
          {regions.map((r, i) => (
            <section key={r.slug} className="grid items-center gap-8 lg:grid-cols-2" aria-labelledby={`r-${r.slug}`}>
              <div className={`relative aspect-[16/10] overflow-hidden rounded-[1.6rem] ${i % 2 ? "lg:order-2" : ""}`}>
                <Landscape variant={regionVariant(r.slug)} seed={i + 3} className="h-full w-full" />
              </div>
              <div>
                <p className="eyebrow flex items-center gap-2"><RegionDot color={r.color} /> {tc("wineriesCount", { count: r.winery_count })}</p>
                <h2 id={`r-${r.slug}`} className="mt-2 text-4xl text-forest md:text-5xl">{pick(r.name, locale)}</h2>
                <p className="mt-4 text-lg leading-relaxed text-stone-700">{field(r.content, "intro", locale).text}</p>
                <p className="mt-6 text-xs font-medium uppercase tracking-wider text-stone-700">{t("subregions")}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {subs.filter((s) => s.region_slug === r.slug).map((s) => (
                    <li key={s.slug}><Link href={{ pathname: "/regions/[region]/[subregion]", params: { region: r.slug, subregion: s.slug } }} className="chip hover:border-forest">{pick(s.name, locale)} <span className="text-stone-700">{s.winery_count}</span></Link></li>
                  ))}
                </ul>
                {districts.some((d) => d.region_slug === r.slug) && (
                  <>
                    <p className="mt-5 text-xs font-medium uppercase tracking-wider text-stone-700">{t("districts")}</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {districts.filter((d) => d.region_slug === r.slug).map((d) => (
                        <li key={d.slug}><Link href={{ pathname: "/districts/[slug]", params: { slug: d.slug } }} className="chip hover:border-forest">{pick(d.name, locale)}</Link></li>
                      ))}
                    </ul>
                  </>
                )}
                <Link href={{ pathname: "/regions/[region]", params: { region: r.slug } }} className="btn btn-primary mt-7">{pick(r.name, locale)} <Icon name="arrowRight" size={16} /></Link>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
