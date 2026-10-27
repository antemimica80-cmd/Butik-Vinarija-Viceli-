import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/ContentPage";
import { Markdown } from "@/components/Markdown";
import { Breadcrumbs, DraftNotice, JsonLd } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { getArticle } from "@/lib/queries/catalog";
import { sql } from "@/lib/db";
import { field, pick, type LocalizedText } from "@/lib/content";
import { pageMetadata, localizedPath } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = await getArticle(slug);
  if (!a) return {};
  return pageMetadata({ title: field(a.content, "title", locale).text, description: field(a.content, "excerpt", locale).text, href: { pathname: "/stories/[slug]", params: { slug } }, locale, type: "article" });
}

export default async function StoryPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const a = await getArticle(slug);
  if (!a) notFound();
  const [t, nav, fmt] = await Promise.all([getTranslations("stories"), getTranslations("nav"), getFormatter()]);
  const title = field(a.content, "title", locale);
  const body = field(a.content, "body", locale);
  const rel = a.related ?? {};
  const [wineries, grapes, regions, sites] = await Promise.all([
    rel.wineries?.length ? sql<{ slug: string; name: string }[]>`select slug, name from wineries where slug in ${sql(rel.wineries)} and status = 'published'` : [],
    rel.grapes?.length ? sql<{ slug: string; name_hr: string; name_en: string }[]>`select slug, name_hr, name_en from grape_varieties where slug in ${sql(rel.grapes)}` : [],
    rel.regions?.length ? sql<{ slug: string; name: LocalizedText }[]>`select slug, name from wine_regions where slug in ${sql(rel.regions)} order by sort` : [],
    rel.sites?.length ? sql<{ slug: string; name: LocalizedText }[]>`select slug, name from vineyard_sites where slug in ${sql(rel.sites)}` : [],
  ]);
  const url = `${SITE_URL}${localizedPath({ pathname: "/stories/[slug]", params: { slug } }, locale)}`;
  return (
    <article>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: title.text, description: field(a.content, "excerpt", locale).text, inLanguage: title.sourceLocale ?? locale, datePublished: a.published_at, dateModified: a.updated_at, author: { "@type": "Organization", name: a.author_name }, mainEntityOfPage: url }} />
      <PageHero title={title.text} intro={field(a.content, "excerpt", locale).text} eyebrow={t(`category.${a.category as "regions"}`)} variant="dalmatia">
        <Breadcrumbs light items={[{ label: nav("stories"), href: "/stories", url: localizedPath("/stories", locale) }, { label: title.text }]} />
      </PageHero>
      <div className="container-x grid gap-12 py-14 lg:grid-cols-[1fr_18rem]">
        <div className="max-w-3xl">
          <p className="mb-8 text-sm text-stone-700">{a.author_name && t("by", { author: a.author_name })}{a.published_at && ` · ${t("published", { date: fmt.dateTime(new Date(a.published_at), { day: "numeric", month: "long", year: "numeric" }) })}`}</p>
          <Markdown source={body.text} />
          <DraftNotice status={body.status} fallback={body.fallback} />
          {a.sources.length > 0 && (
            <section className="mt-12 border-t border-line pt-6">
              <h2 className="text-2xl">{t("sources")}</h2>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">{a.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-forest underline">{s.label}</a></li>)}</ol>
            </section>
          )}
        </div>
        {(wineries.length + grapes.length + regions.length + sites.length) > 0 && (
          <aside className="card self-start p-6">
            <h2 className="font-display text-2xl">{t("related")}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {regions.map((r) => <li key={r.slug}><Link href={{ pathname: "/regions/[region]", params: { region: r.slug } }} className="flex items-center gap-2 hover:text-forest"><Icon name="layers" size={15} />{pick(r.name, locale)}</Link></li>)}
              {sites.map((s) => <li key={s.slug}><Link href={{ pathname: "/sites/[slug]", params: { slug: s.slug } }} className="flex items-center gap-2 hover:text-forest"><Icon name="pin" size={15} />{pick(s.name, locale)}</Link></li>)}
              {grapes.map((g) => <li key={g.slug}><Link href={{ pathname: "/grapes/[slug]", params: { slug: g.slug } }} className="flex items-center gap-2 hover:text-forest"><Icon name="grape" size={15} />{locale === "hr" ? g.name_hr : g.name_en}</Link></li>)}
              {wineries.map((w) => <li key={w.slug}><Link href={{ pathname: "/wineries/[slug]", params: { slug: w.slug } }} className="flex items-center gap-2 hover:text-forest"><Icon name="glass" size={15} />{w.name}</Link></li>)}
            </ul>
          </aside>
        )}
      </div>
    </article>
  );
}
