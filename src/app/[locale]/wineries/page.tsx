import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { WineryCard } from "@/components/WineryCard";
import { DirectoryFilters } from "@/components/filters/DirectoryFilters";
import { Pagination } from "@/components/Pagination";
import { Breadcrumbs, EmptyState } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { parseFilters, filtersToParams, isIndexable } from "@/lib/filters";
import { searchWineries } from "@/lib/queries/wineries";
import { getFacets } from "@/lib/queries/facets";
import { pageMetadata, localizedPath } from "@/lib/seo";
import { pick } from "@/lib/content";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const f = parseFilters(await searchParams);
  const t = await getTranslations({ locale, namespace: "wineries" });
  let title = t("metaTitle");
  if (f.region?.length === 1 && isIndexable(f)) {
    const r = (await getFacets()).regions.find((x) => x.slug === f.region![0]);
    if (r) title = `${t("title")} — ${pick(r.name, locale)}`;
  }
  return pageMetadata({ title, description: t("metaDescription"), href: "/wineries", locale, noindex: !isIndexable(f) });
}

export default async function WineriesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const filters = parseFilters(await searchParams);
  const [result, facets, t, nav] = await Promise.all([searchWineries(filters), getFacets(), getTranslations("wineries"), getTranslations("nav")]);
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const query = Object.fromEntries([...filtersToParams({ ...filters, page: undefined }).entries()]);

  return (
    <div className="container-x pb-10 pt-8 md:pt-12">
      <Breadcrumbs items={[{ label: nav("wineries"), url: localizedPath("/wineries", locale) }]} />
      <header className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-5xl text-forest md:text-6xl">{t("title")}</h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-700">{t("intro")}</p>
        </div>
        <Link href={{ pathname: "/map", query }} className="btn btn-primary self-start md:self-auto"><Icon name="map" size={18} /> {t("viewOnMap")}</Link>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[18rem_1fr]">
        <aside className="hidden lg:block"><div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2"><DirectoryFilters filters={filters} facets={facets} total={result.total} mode="sidebar" /></div></aside>
        <section aria-label={t("title")}>
          <DirectoryFilters filters={filters} facets={facets} total={result.total} mode="toolbar" />
          {result.items.length ? (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((w) => <li key={w.id}><WineryCard w={w} /></li>)}
            </ul>
          ) : (
            <div className="mt-6"><EmptyState title={(await getTranslations("filters"))("noResultsTitle")} body={(await getTranslations("filters"))("noResultsBody")} /></div>
          )}
          <Pagination pathname="/wineries" query={query} page={result.page} pages={pages} />
        </section>
      </div>
    </div>
  );
}
