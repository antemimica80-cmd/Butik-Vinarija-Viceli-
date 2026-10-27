import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/ContentPage";
import { ClaimForm } from "@/components/forms/ClaimForm";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "claim" });
  return pageMetadata({ title: t("listTitle"), description: t("listIntro"), href: "/list-your-winery", locale });
}

export default async function ListYourWineryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, nav] = await Promise.all([getTranslations("claim"), getTranslations("nav")]);
  return (
    <>
      <PageHero title={t("listTitle")} intro={t("listIntro")} variant="uplands" />
      <div className="container-x max-w-2xl py-14">
        <ClaimForm wineries={[]} listing />
        <p className="mt-8 text-sm text-stone-700"><Link href="/claim" className="text-forest underline">{t("title")}</Link> · <Link href="/coverage" className="text-forest underline">{nav("coverage")}</Link></p>
      </div>
    </>
  );
}
