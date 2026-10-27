import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/ContentPage";
import { Breadcrumbs, EmptyState, RegionDot } from "@/components/ui";
import { Pagination } from "@/components/Pagination";
import { Icon } from "@/components/Icon";
import { searchWines, getRegions } from "@/lib/queries/catalog";
import { grapeName, pick } from "@/lib/content";
import { WINE_TYPES } from "@/lib/constants";
import { pageMetadata, localizedPath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "wines" });
  return pageMetadata({ title: t("metaTitle"), description: t("metaDescription"), href: "/wines", locale, noindex: Object.keys(sp).length > 0 });
}

export default async function WinesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const type = WINE_TYPES.includes(sp.type as never) ? [sp.type!] : undefined;
  const region = sp.region && /^[a-z0-9-]+$/.test(sp.region) ? [sp.region] : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const [t, tw, nav, ts, regions, result] = await Promise.all([
    getTranslations("wines"), getTranslations("wineType"), getTranslations("nav"), getTranslations("search"), getRegions(),
    searchWines({ q: sp.q?.slice(0, 100), type, region, awarded: sp.awarded === "1", page }),
  ]);
  const query = Object.fromEntries(Object.entries({ q: sp.q, type: sp.type, region: sp.region, awarded: sp.awarded }).filter(([, v]) => v)) as Record<string, string>;
  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} variant="istria">
        <Breadcrumbs light items={[{ label: nav("wines"), url: localizedPath("/wines", locale) }]} />
      </PageHero>
      <div className="container-x py-12">
        <form role="search" className="grid gap-3 md:grid-cols-[1fr_12rem_14rem_auto]">
          <label className="sr-only" htmlFor="wq">{t("searchPlaceholder")}</label>
          <input id="wq" name="q" defaultValue={sp.q} placeholder={t("searchPlaceholder")} className="field" />
          <select name="type" defaultValue={sp.type ?? ""} className="field" aria-label={t("type")}>
            <option value="">{t("type")}</option>
            {WINE_TYPES.map((w) => <option key={w} value={w}>{tw(w)}</option>)}
          </select>
          <select name="region" defaultValue={sp.region ?? ""} className="field" aria-label={nav("regions")}>
            <option value="">{nav("regions")}</option>
            {regions.map((r) => <option key={r.slug} value={r.slug}>{pick(r.name, locale)}</option>)}
          </select>
          <button className="btn btn-primary"><Icon name="search" size={16} /> {ts("submit")}</button>
        </form>
        <p className="mt-6 text-sm font-medium">{(await getTranslations("common"))("winesCount", { count: result.total })}</p>
        {result.items.length ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((w) => (
              <li key={w.id} className="group relative flex gap-4 rounded-2xl border border-line bg-paper p-4 transition-shadow hover:shadow-soft">
                <span className="grid h-20 w-12 shrink-0 place-items-center rounded-xl" style={{ background: w.type === "red" ? "#792E39" : w.type === "rose" ? "#D9A3A3" : w.type === "orange" ? "#C98A3E" : "#E6D9A8" }}>
                  <Icon name="bottle" size={22} className={w.type === "red" ? "text-ivory" : "text-forest"} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-stone-700">{tw(w.type as "red")}</p>
                  <h2 className="mt-1 font-display text-xl leading-tight"><Link href={{ pathname: "/wines/[slug]", params: { slug: w.slug } }} className="after:absolute after:inset-0">{w.name}</Link></h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-700"><RegionDot color={w.region_color} className="h-2 w-2" />{w.winery_name}{w.town ? ` · ${w.town}` : ""}</p>
                  <p className="mt-1 text-xs text-stone-700">{w.grapes.map((g) => grapeName(g, locale)).join(", ")}{pick(w.site_name, locale) ? ` · ${pick(w.site_name, locale)}` : ""}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : <div className="mt-6"><EmptyState icon="bottle" title={t("empty")} /></div>}
        <Pagination pathname="/wines" query={query} page={page} pages={Math.ceil(result.total / result.pageSize)} />
      </div>
    </>
  );
}
