import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Explorer } from "@/components/map/Explorer";
import { parseFilters, activeFilterCount } from "@/lib/filters";
import { searchWineries } from "@/lib/queries/wineries";
import { getFacets } from "@/lib/queries/facets";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "map" });
  const f = parseFilters(await searchParams);
  return pageMetadata({ title: t("metaTitle"), description: t("metaDescription"), href: "/map", locale, noindex: activeFilterCount(f) > 0 });
}

export default async function MapPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [results, facets, t] = await Promise.all([searchWineries(filters), getFacets(), getTranslations("map")]);
  return (
    <>
      <h1 className="sr-only">{t("title")}</h1>
      <Explorer initialFilters={filters} initialResults={results} facets={facets} autoLocate={sp.locate === "1"} />
    </>
  );
}
