import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/ContentPage";
import { Breadcrumbs, RegionDot } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { RouteMap } from "@/components/routes/RouteMap";
import { getRouteBySlug, getRouteStops } from "@/lib/queries/catalog";
import { getCurrentUser } from "@/lib/auth";
import { pick } from "@/lib/content";
import { pageMetadata, localizedPath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const r = await getRouteBySlug(slug);
  if (!r) return {};
  return pageMetadata({ title: pick(r.title, locale), description: pick(r.description, locale), href: { pathname: "/routes/[slug]", params: { slug } }, locale, noindex: !r.is_editorial });
}

export default async function RouteDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const r = await getRouteBySlug(slug);
  if (!r) notFound();
  // Personal routes are private unless the owner made them public.
  if (!r.is_public) {
    const u = await getCurrentUser();
    if (!u || u.id !== r.user_id) notFound();
  }
  const [t, nav, stops] = await Promise.all([getTranslations("routes"), getTranslations("nav"), getRouteStops(r.id)]);
  const slugs = stops.map((s) => s.slug).join(",");
  return (
    <>
      <PageHero title={pick(r.title, locale)} intro={pick(r.description, locale)} eyebrow={t("stops", { count: stops.length })} variant="dalmatia">
        <Breadcrumbs light items={[{ label: nav("routes"), href: "/routes", url: localizedPath("/routes", locale) }, { label: pick(r.title, locale) }]} />
      </PageHero>
      <div className="container-x grid gap-10 py-14 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <ol className="space-y-3">
            {stops.map((s, i) => (
              <li key={s.winery_id} className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-burgundy font-display text-xl text-ivory">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <Link href={{ pathname: "/wineries/[slug]", params: { slug: s.slug } }} className="block font-display text-2xl leading-tight hover:text-forest">{s.name}</Link>
                  <span className="flex items-center gap-1.5 text-sm text-stone-700"><RegionDot color={s.region_color} className="h-2 w-2" />{s.town}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-6 flex items-start gap-2 text-sm text-stone-700"><Icon name="info" size={16} className="mt-0.5 shrink-0" /> {t("visitNote")} {t("approximateNote")}</p>
          <Link href={{ pathname: "/routes/planner", query: { stops: slugs } }} className="btn btn-wine mt-6"><Icon name="route" size={18} /> {t("loadIntoPlanner")}</Link>
        </div>
        <div className="h-[28rem] overflow-hidden rounded-[1.6rem] border border-line lg:h-[36rem]">
          <RouteMap stops={stops} />
        </div>
      </div>
    </>
  );
}
