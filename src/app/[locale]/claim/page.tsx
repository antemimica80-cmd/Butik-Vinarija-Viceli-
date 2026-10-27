import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/ContentPage";
import { ClaimForm } from "@/components/forms/ClaimForm";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ winery?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "claim" });
  return pageMetadata({ title: t("metaTitle"), description: t("intro"), href: "/claim", locale });
}

export default async function ClaimPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, nav, sp, user] = await Promise.all([getTranslations("claim"), getTranslations("nav"), searchParams, getCurrentUser()]);
  const wineries = await sql<{ id: number; slug: string; name: string; town: string | null }[]>`
    select w.id, w.slug, w.name, l.town from wineries w left join winery_locations l on l.winery_id = w.id and l.is_primary
    where w.status = 'published' order by atlas_norm(w.name)`;
  const selected = wineries.find((w) => w.slug === sp.winery)?.id ?? null;
  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} />
      <div className="container-x max-w-2xl py-14">
        {!user && <p className="mb-6 rounded-xl bg-forest-100 p-4 text-sm text-forest">{t("signInNote")} <Link href="/login" className="underline">{nav("login")}</Link></p>}
        <ClaimForm wineries={wineries} selected={selected} listing={false} />
        <p className="mt-8 text-sm text-stone-700">{t("notListed")} → <Link href="/list-your-winery" className="text-forest underline">{nav("listWinery")}</Link></p>
      </div>
    </>
  );
}
