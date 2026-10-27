import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import { sql } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type Href = Parameters<typeof getPathname>[0]["href"];

function entry(href: Href, lastModified?: Date | string, priority = 0.6): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [l, `${SITE_URL}${getPathname({ href, locale: l })}`]));
  return locales.map((l) => ({ url: `${SITE_URL}${getPathname({ href, locale: l })}`, lastModified, priority, alternates: { languages } }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [wineries, regions, subs, districts, sites, grapes, wines, articles, routes] = await Promise.all([
    sql<{ slug: string; updated_at: Date }[]>`select slug, updated_at from wineries where status = 'published'`,
    sql<{ slug: string }[]>`select slug from wine_regions`,
    sql<{ slug: string; region: string }[]>`select s.slug, r.slug as region from wine_subregions s join wine_regions r on r.id = s.region_id`,
    sql<{ slug: string }[]>`select slug from wine_districts`,
    sql<{ slug: string }[]>`select slug from vineyard_sites`,
    sql<{ slug: string }[]>`select slug from grape_varieties`,
    sql<{ slug: string; updated_at: Date }[]>`select wi.slug, wi.updated_at from wines wi join wineries w on w.id = wi.winery_id where wi.status = 'published' and w.status = 'published'`,
    sql<{ slug: string; updated_at: Date }[]>`select slug, updated_at from editorial_articles where status = 'published'`,
    sql<{ slug: string }[]>`select slug from wine_routes where is_editorial and is_public`,
  ]);
  const statics: Href[] = ["/", "/wineries", "/map", "/regions", "/grapes", "/wines", "/awards", "/experiences", "/routes", "/routes/planner", "/stories", "/about", "/coverage", "/contact", "/list-your-winery", "/claim", "/privacy", "/terms"];
  return [
    ...statics.flatMap((h) => entry(h, undefined, h === "/" ? 1 : 0.7)),
    ...wineries.flatMap((w) => entry({ pathname: "/wineries/[slug]", params: { slug: w.slug } }, w.updated_at, 0.8)),
    ...regions.flatMap((r) => entry({ pathname: "/regions/[region]", params: { region: r.slug } }, undefined, 0.8)),
    ...subs.flatMap((s) => entry({ pathname: "/regions/[region]/[subregion]", params: { region: s.region, subregion: s.slug } })),
    ...districts.flatMap((d) => entry({ pathname: "/districts/[slug]", params: { slug: d.slug } })),
    ...sites.flatMap((s) => entry({ pathname: "/sites/[slug]", params: { slug: s.slug } })),
    ...grapes.flatMap((g) => entry({ pathname: "/grapes/[slug]", params: { slug: g.slug } }, undefined, 0.7)),
    ...wines.flatMap((w) => entry({ pathname: "/wines/[slug]", params: { slug: w.slug } }, w.updated_at, 0.5)),
    ...articles.flatMap((a) => entry({ pathname: "/stories/[slug]", params: { slug: a.slug } }, a.updated_at, 0.6)),
    ...routes.flatMap((r) => entry({ pathname: "/routes/[slug]", params: { slug: r.slug } })),
  ];
}
