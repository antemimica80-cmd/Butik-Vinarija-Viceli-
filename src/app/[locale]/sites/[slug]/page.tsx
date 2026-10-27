import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AreaPage } from "@/components/AreaPage";
import { DraftNotice } from "@/components/ui";
import { getSite, searchWines } from "@/lib/queries/catalog";
import { searchWineries } from "@/lib/queries/wineries";
import { pick, field, grapeName } from "@/lib/content";
import { pageMetadata, localizedPath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const s = await getSite(slug);
  if (!s) return {};
  const t = await getTranslations({ locale, namespace: "site" });
  return pageMetadata({ title: `${pick(s.name, locale)} — ${t("kind")}`, description: field(s.content, "intro", locale).text.slice(0, 200), href: { pathname: "/sites/[slug]", params: { slug } }, locale });
}

export default async function SitePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const s = await getSite(slug);
  if (!s) notFound();
  const [t, tw, nav, list, wines] = await Promise.all([getTranslations("site"), getTranslations("wineType"), getTranslations("nav"), searchWineries({ site: s.slug }, { pageSize: 12 }), searchWines({ site: s.slug })]);
  const name = pick(s.name, locale);
  const intro = field(s.content, "intro", locale);
  const terroir = field(s.content, "terroir", locale);
  return (
    <AreaPage
      crumbs={[
        { label: nav("regions"), href: "/regions", url: localizedPath("/regions", locale) },
        ...(s.region_slug ? [{ label: pick(s.region_name, locale), href: { pathname: "/regions/[region]" as const, params: { region: s.region_slug } } }] : []),
        ...(s.district_slug ? [{ label: pick(s.district_name, locale), href: { pathname: "/districts/[slug]" as const, params: { slug: s.district_slug } } }] : []),
        { label: name, url: localizedPath({ pathname: "/sites/[slug]", params: { slug } }, locale) },
      ]}
      eyebrow={t("kind")} title={name} color={s.region_color} regionSlug={s.region_slug} verification={s.verification}
      wineries={list.items} total={list.total} filter={{ site: s.slug }}
    >
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-xl leading-relaxed">{intro.text}</p>
          {terroir.text && <><h2 className="mt-8 text-3xl text-forest">{t("terroir")}</h2><p className="mt-3 leading-relaxed text-stone-700">{terroir.text}</p></>}
          <DraftNotice status={intro.status} fallback={intro.fallback} />
        </div>
        <div className="card p-6">
          <h2 className="font-display text-2xl">{t("wines", { site: name })}</h2>
          <ul className="mt-3 divide-y divide-line">
            {wines.items.map((w) => (
              <li key={w.id} className="py-3">
                <Link href={{ pathname: "/wines/[slug]", params: { slug: w.slug } }} className="font-medium hover:text-forest">{w.name}</Link>
                <p className="text-sm text-stone-700">{w.winery_name} · {tw(w.type as "red")} · {w.grapes.map((g) => grapeName(g, locale)).join(", ")}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AreaPage>
  );
}
