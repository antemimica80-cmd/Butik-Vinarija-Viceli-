import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarkdownPage } from "@/components/ContentPage";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return pageMetadata({ title: t("termsTitle"), description: t("termsTitle"), href: "/terms", locale });
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  return <MarkdownPage locale={locale} name="terms" title={t("termsTitle")} />;
}
