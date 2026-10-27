import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AreaPage } from "@/components/AreaPage";
import { getSubregion, getDistricts } from "@/lib/queries/catalog";
import { searchWineries } from "@/lib/queries/wineries";
import { pick } from "@/lib/content";
import { pageMetadata, localizedPath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale; region: string; subregion: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, region, subregion } = await params;
  const s = await getSubregion(subregion);
  if (!s || s.region_slug !== region) return {};
  const t = await getTranslations({ locale, namespace: "regions" });
  return pageMetadata({ title: `${pick(s.name, locale)} — ${pick(s.region_name, locale)}`, description: `${t("partOf", { parent: pick(s.region_name, locale) })}. ${t("wineriesTitle", { region: pick(s.name, locale) })}.`, href: { pathname: "/regions/[region]/[subregion]", params: { region, subregion } }, locale });
}

export default async function SubregionPage({ params }: Props) {
  const { locale, region, subregion } = await params;
  setRequestLocale(locale);
  const s = await getSubregion(subregion);
  if (!s || s.region_slug !== region) notFound();
  const [t, nav, list, districts] = await Promise.all([getTranslations("regions"), getTranslations("nav"), searchWineries({ subregion: [s.slug] }, { pageSize: 12 }), getDistricts(s.id)]);
  const name = pick(s.name, locale);
  return (
    <AreaPage
      crumbs={[
        { label: nav("regions"), href: "/regions", url: localizedPath("/regions", locale) },
        { label: pick(s.region_name, locale), href: { pathname: "/regions/[region]", params: { region } }, url: localizedPath({ pathname: "/regions/[region]", params: { region } }, locale) },
        { label: name, url: localizedPath({ pathname: "/regions/[region]/[subregion]", params: { region, subregion } }, locale) },
      ]}
      eyebrow={t("partOf", { parent: pick(s.region_name, locale) })}
      title={name} color={s.region_color} regionSlug={region} verification={s.verification}
      wineries={list.items} total={list.total} filter={{ subregion: [s.slug] }}
    >
      <h2 className="text-3xl text-forest">{t("districts")}</h2>
      {districts.length ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {districts.map((d) => <li key={d.slug}><Link href={{ pathname: "/districts/[slug]", params: { slug: d.slug } }} className="chip hover:border-forest">{pick(d.name, locale)} <span className="text-stone-700">{d.winery_count}</span></Link></li>)}
        </ul>
      ) : <p className="mt-3 text-stone-700">{t("noDistricts")}</p>}
      <p className="mt-3 text-xs text-stone-700">{t("officialName")}: {s.official_name} · {t("districtNote")}</p>
    </AreaPage>
  );
}
