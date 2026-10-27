import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getWineryBySlug } from "@/lib/queries/profile";
import { sql } from "@/lib/db";
import { pick, type LocalizedText } from "@/lib/content";
import { issueFormToken } from "@/lib/security";
import { pageMetadata, localizedPath } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui";
import { InquiryForm } from "@/components/winery/InquiryForm";
import { Icon } from "@/components/Icon";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale; slug: string }>; searchParams: Promise<{ experience?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const w = await getWineryBySlug(slug);
  if (!w) return {};
  const t = await getTranslations({ locale, namespace: "inquiry" });
  return pageMetadata({ title: t("metaTitle", { name: w.name }), description: t("intro", { name: w.name }), href: { pathname: "/wineries/[slug]/inquiry", params: { slug } }, locale, noindex: true });
}

export default async function InquiryPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const w = await getWineryBySlug(slug);
  if (!w) notFound();
  const [t, nav, sp] = await Promise.all([getTranslations("inquiry"), getTranslations("nav"), searchParams]);
  const experiences = await sql<{ id: number; name: LocalizedText }[]>`
    select id, name from tasting_experiences where winery_id = ${w.id} and is_active and verification <> 'unverified' order by sort, id`;
  const initial = Number(sp.experience);
  return (
    <div className="container-x max-w-3xl pb-10 pt-8 md:pt-12">
      <Breadcrumbs items={[
        { label: nav("wineries"), href: "/wineries", url: localizedPath("/wineries", locale) },
        { label: w.name, href: { pathname: "/wineries/[slug]", params: { slug } }, url: localizedPath({ pathname: "/wineries/[slug]", params: { slug } }, locale) },
        { label: t("title") },
      ]} />
      <h1 className="mt-6 text-5xl text-forest md:text-6xl">{t("title")}</h1>
      <p className="mt-4 text-lg leading-relaxed text-stone-700">{t("intro", { name: w.name })}</p>
      <p className="mt-2 flex items-center gap-2 text-sm text-forest"><Icon name="check" size={16} /> {t("noAccount")}</p>
      {!w.email && <p className="mt-2 flex items-center gap-2 text-sm text-stone-700"><Icon name="info" size={16} /> {t("toWineryNote")}</p>}
      <div className="mt-8">
        <InquiryForm
          wineryId={w.id}
          wineryName={w.name}
          slug={slug}
          experiences={experiences.map((e) => ({ id: e.id, name: pick(e.name, locale) }))}
          initialExperience={experiences.some((e) => e.id === initial) ? initial : null}
          formToken={issueFormToken()}
          languages={w.languages}
        />
      </div>
    </div>
  );
}
