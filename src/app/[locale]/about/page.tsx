import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarkdownPage } from "@/components/ContentPage";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return pageMetadata({ title: t("metaTitle"), description: t("intro"), href: "/about", locale });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  return <MarkdownPage locale={locale} name="about" title={t("title")} intro={t("intro")} />;
}
