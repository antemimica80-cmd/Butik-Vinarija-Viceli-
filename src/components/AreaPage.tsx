import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Landscape, regionVariant } from "./Landscape";
import { Breadcrumbs, RegionDot, SectionHeading, VerificationBadge, type Crumb } from "./ui";
import { WineryGrid } from "./WineryGrid";
import { RegionMap } from "./RegionMap";
import { Icon } from "./Icon";
import type { CardWinery } from "./WineryCard";
import type { WineryFilters } from "@/lib/filters";
import { filtersToParams } from "@/lib/filters";

/** Shared layout for subregion, wine district and vineyard-site pages. */
export async function AreaPage({ crumbs, eyebrow, title, color, regionSlug, verification, children, wineries, total, filter }: {
  crumbs: Crumb[]; eyebrow: string; title: string; color: string | null; regionSlug: string | null; verification: string;
  children?: ReactNode; wineries: CardWinery[]; total: number; filter: WineryFilters;
}) {
  const [t, tc] = await Promise.all([getTranslations("regions"), getTranslations("common")]);
  const query = filtersToParams(filter).toString();
  return (
    <>
      <header className="relative isolate overflow-hidden bg-forest text-ivory">
        <Landscape variant={regionVariant(regionSlug)} seed={title.length + 9} className="absolute inset-0 -z-10 h-full w-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
        <div className="container-x pb-12 pt-10 md:pb-16">
          <Breadcrumbs light items={crumbs} />
          <p className="eyebrow eyebrow-light mt-24 flex items-center gap-2 md:mt-32"><RegionDot color={color} /> {eyebrow}</p>
          <h1 className="mt-3 text-5xl md:text-7xl">{title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-ivory/80">
            <span>{tc("wineriesCount", { count: total })}</span>
            <VerificationBadge state={verification} compact />
          </div>
        </div>
      </header>
      {children && <div className="container-x py-14">{children}</div>}
      <section className="container-x pb-12">
        <div className="h-[24rem] overflow-hidden rounded-[1.6rem] border border-line"><RegionMap query={query} /></div>
        <p className="mt-3 text-xs text-stone-700">{t("boundaryNote")}</p>
      </section>
      <section className="container-x pb-10">
        <SectionHeading title={t("wineriesTitle", { region: title })}
          action={total > wineries.length ? <Link href={{ pathname: "/wineries", query: Object.fromEntries(new URLSearchParams(query)) }} className="btn btn-primary">{tc("viewAll")} <Icon name="arrowRight" size={16} /></Link> : undefined} />
        {wineries.length ? <WineryGrid items={wineries} /> : <p className="text-stone-700">{tc("wineriesCount", { count: 0 })}</p>}
      </section>
    </>
  );
}
