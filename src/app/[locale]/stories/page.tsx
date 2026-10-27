import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/ContentPage";
import { Landscape } from "@/components/Landscape";
import { Breadcrumbs, EmptyState } from "@/components/ui";
import { getArticles } from "@/lib/queries/catalog";
import { field } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { pageMetadata, localizedPath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "stories" });
  return pageMetadata({ title: t("metaTitle"), description: t("metaDescription"), href: "/stories", locale });
}

export default async function StoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, nav, fmt, articles] = await Promise.all([getTranslations("stories"), getTranslations("nav"), getFormatter(), getArticles()]);
  const variants = ["dalmatia", "istria", "uplands", "slavonia"] as const;
  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} variant="istria">
        <Breadcrumbs light items={[{ label: nav("stories"), url: localizedPath("/stories", locale) }]} />
      </PageHero>
      <div className="container-x py-14">
        {articles.length ? (
          <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <li key={a.id}>
                <article className="group relative flex h-full flex-col">
                  <div className="aspect-[16/10] overflow-hidden rounded-[1.4rem]">
                    {a.hero_path ? <img src={mediaUrl(a.hero_path)!} alt="" className="h-full w-full object-cover" /> : <Landscape variant={variants[i % 4]} seed={i + 30} className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]" />}
                  </div>
                  <p className="eyebrow mt-5">{t(`category.${a.category as "regions"}`)}</p>
                  <h2 className="mt-2 font-display text-3xl leading-tight"><Link href={{ pathname: "/stories/[slug]", params: { slug: a.slug } }} className="after:absolute after:inset-0 group-hover:text-forest">{field(a.content, "title", locale).text}</Link></h2>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-stone-700">{field(a.content, "excerpt", locale).text}</p>
                  {a.published_at && <p className="mt-3 text-xs text-stone-700">{t("published", { date: fmt.dateTime(new Date(a.published_at), { day: "numeric", month: "long", year: "numeric" }) })}</p>}
                </article>
              </li>
            ))}
          </ul>
        ) : <EmptyState icon="book" title={t("empty")} />}
      </div>
    </>
  );
}
