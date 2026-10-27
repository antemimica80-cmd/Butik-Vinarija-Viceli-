import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AreaPage } from "@/components/AreaPage";
import { getDistrict, getSites } from "@/lib/queries/catalog";
import { searchWineries } from "@/lib/queries/wineries";
import { pick, field } from "@/lib/content";
import { pageMetadata, localizedPath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const d = await getDistrict(slug);
  if (!d) return {};
  const t = await getTranslations({ locale, namespace: "regions" });
  return pageMetadata({ title: `${pick(d.name, locale)} — ${t("districts")}`, description: t("wineriesTitle", { region: pick(d.name, locale) }), href: { pathname: "/districts/[slug]", params: { slug } }, locale });
}

export default async function DistrictPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const d = await getDistrict(slug);
  if (!d) notFound();
  const [t, nav, list, sites] = await Promise.all([getTranslations("regions"), getTranslations("nav"), searchWineries({ district: [d.slug] }, { pageSize: 12 }), getSites()]);
  const mine = sites.filter((s) => s.district_slug === d.slug);
  return (
    <AreaPage
      crumbs={[
        { label: nav("regions"), href: "/regions", url: localizedPath("/regions", locale) },
        { label: pick(d.region_name, locale), href: { pathname: "/regions/[region]", params: { region: d.region_slug } } },
        { label: pick(d.subregion_name, locale), href: { pathname: "/regions/[region]/[subregion]", params: { region: d.region_slug, subregion: d.subregion_slug } } },
        { label: pick(d.name, locale), url: localizedPath({ pathname: "/districts/[slug]", params: { slug } }, locale) },
      ]}
      eyebrow={`${t("districts")} · ${pick(d.subregion_name, locale)}`}
      title={pick(d.name, locale)} color={d.region_color} regionSlug={d.region_slug} verification={d.verification}
      wineries={list.items} total={list.total} filter={{ district: [d.slug] }}
    >
      {mine.length > 0 && (
        <>
          <h2 className="text-3xl text-forest">{t("sites")}</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {mine.map((s) => <li key={s.slug}><Link href={{ pathname: "/sites/[slug]", params: { slug: s.slug } }} className="chip hover:border-forest">{pick(s.name, locale)}</Link></li>)}
          </ul>
        </>
      )}
      <p className="mt-4 text-xs text-stone-700">{field(d.content, "note", locale).text}</p>
    </AreaPage>
  );
}
