import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/ContentPage";
import { Breadcrumbs, RegionDot } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { getEditorialRoutes } from "@/lib/queries/catalog";
import { pick } from "@/lib/content";
import { pageMetadata, localizedPath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "routes" });
  return pageMetadata({ title: t("metaTitle"), description: t("metaDescription"), href: "/routes", locale });
}

export default async function RoutesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, nav, routes] = await Promise.all([getTranslations("routes"), getTranslations("nav"), getEditorialRoutes()]);
  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} variant="dalmatia">
        <Breadcrumbs light items={[{ label: nav("routes"), url: localizedPath("/routes", locale) }]} />
      </PageHero>
      <div className="container-x py-14">
        <div className="card topo-bg flex flex-col items-start justify-between gap-5 p-7 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl text-forest">{t("plannerTitle")}</h2>
            <p className="mt-2 max-w-xl text-stone-700">{t("plannerIntro")}</p>
          </div>
          <Link href="/routes/planner" className="btn btn-wine"><Icon name="route" size={18} /> {t("openPlanner")}</Link>
        </div>
        <h2 className="mt-14 text-4xl text-forest">{t("editorial")}</h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {routes.map((r) => (
            <li key={r.id}>
              <article className="group relative flex h-full flex-col rounded-[1.4rem] border border-line bg-paper p-6 transition-shadow hover:shadow-lift">
                <p className="eyebrow flex items-center gap-2">{(r.region_colors ?? []).map((c) => <RegionDot key={c} color={c} />)} {t("stops", { count: r.stop_count })}</p>
                <h3 className="mt-3 font-display text-3xl leading-tight"><Link href={{ pathname: "/routes/[slug]", params: { slug: r.slug } }} className="after:absolute after:inset-0">{pick(r.title, locale)}</Link></h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-700">{pick(r.description, locale)}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
