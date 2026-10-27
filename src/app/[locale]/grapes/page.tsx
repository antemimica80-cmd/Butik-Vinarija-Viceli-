import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/ContentPage";
import { Breadcrumbs, EmptyState, RegionDot } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { getGrapes } from "@/lib/queries/catalog";
import { field, grapeName, pick } from "@/lib/content";
import { pageMetadata, localizedPath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ q?: string; color?: string; origin?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "grapes" });
  return pageMetadata({ title: t("metaTitle"), description: t("metaDescription"), href: "/grapes", locale, noindex: !!(sp.q || sp.color || sp.origin) });
}

const swatch = (c: string) => (c === "red" ? "#792E39" : c === "grey" ? "#B88A8E" : "#C9B26A");

export default async function GrapesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const color = ["white", "red", "grey"].includes(sp.color ?? "") ? sp.color : undefined;
  const origin = ["indigenous", "regional", "international"].includes(sp.origin ?? "") ? sp.origin : undefined;
  const [t, nav, grapes] = await Promise.all([getTranslations("grapes"), getTranslations("nav"), getGrapes({ q: sp.q, color, origin })]);
  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} variant="slavonia">
        <Breadcrumbs light items={[{ label: nav("grapes"), url: localizedPath("/grapes", locale) }]} />
      </PageHero>
      <div className="container-x py-12">
        <form className="flex flex-col gap-3 md:flex-row md:items-end" role="search">
          <div className="flex-1">
            <label htmlFor="gq" className="sr-only">{t("searchPlaceholder")}</label>
            <input id="gq" name="q" defaultValue={sp.q} placeholder={t("searchPlaceholder")} className="field" />
          </div>
          <select name="color" defaultValue={color ?? ""} className="field md:!w-48" aria-label={t("colorAll")}>
            <option value="">{t("colorAll")}</option>
            {(["white", "red", "grey"] as const).map((c) => <option key={c} value={c}>{t(`color.${c}`)}</option>)}
          </select>
          <select name="origin" defaultValue={origin ?? ""} className="field md:!w-56" aria-label={t("originAll")}>
            <option value="">{t("originAll")}</option>
            {(["indigenous", "regional", "international"] as const).map((o) => <option key={o} value={o}>{t(`origin.${o}`)}</option>)}
          </select>
          <button className="btn btn-primary"><Icon name="search" size={16} /> {(await getTranslations("search"))("submit")}</button>
        </form>
        {grapes.length ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {grapes.map((g) => (
              <li key={g.slug}>
                <article className="group relative flex h-full flex-col rounded-[1.4rem] border border-line bg-paper p-6 transition-shadow hover:shadow-lift">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex gap-1" aria-hidden>{[0, 1, 2].map((i) => <span key={i} className="h-3.5 w-3.5 rounded-full" style={{ background: swatch(g.berry_color), opacity: 1 - i * 0.25 }} />)}</span>
                    <span className={`chip ${g.origin === "indigenous" ? "chip-wine" : ""}`}>{t(`origin.${g.origin as "indigenous"}`)}</span>
                  </div>
                  <h2 className="mt-5 font-display text-3xl leading-tight">
                    <Link href={{ pathname: "/grapes/[slug]", params: { slug: g.slug } }} className="after:absolute after:inset-0">{grapeName(g, locale)}</Link>
                  </h2>
                  {g.synonyms.length > 0 && <p className="mt-1 text-xs text-stone-700">{t("synonyms")}: {g.synonyms.slice(0, 3).join(", ")}</p>}
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone-700">{field(g.content, "summary", locale).text}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 text-xs text-stone-700">
                    {g.regions.map((r) => <span key={r.slug} className="flex items-center gap-1.5"><RegionDot color={r.color} className="h-2 w-2" />{pick(r.name, locale)}</span>)}
                    <span className="ml-auto">{t("wineries", { count: g.winery_count })}</span>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : <div className="mt-10"><EmptyState icon="grape" title={t("empty")} /></div>}
      </div>
    </>
  );
}
