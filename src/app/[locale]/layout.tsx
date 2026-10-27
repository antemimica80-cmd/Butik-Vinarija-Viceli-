import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { EB_Garamond, DM_Sans } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SITE_URL } from "@/lib/site";

const display = EB_Garamond({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-serif-display", display: "swap" });
const sans = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-dm-sans", display: "swap" });

// Public pages read live data from Postgres so admin edits appear immediately.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#193C34", width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "hr" | "en", namespace: "common" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("siteName"), template: `%s · ${t("siteName")}` },
    description: t("tagline"),
    applicationName: t("siteName"),
    icons: { icon: "/icon.svg" },
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("common");
  return (
    <html lang={locale} className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider>
          <a href="#main" className="sr-only-focusable fixed left-4 top-3 z-[100] rounded-full bg-forest px-4 py-2 text-ivory">{t("skipToContent")}</a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
