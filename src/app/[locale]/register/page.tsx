import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthForm } from "@/components/forms/AuthForm";
import { Landscape } from "@/components/Landscape";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return pageMetadata({ title: t("registerTitle"), description: t("registerIntro"), href: "/register", locale, noindex: true });
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  return (
    <div className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block"><Landscape variant="slavonia" seed={8} className="absolute inset-0 h-full w-full" /></div>
      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-5xl text-forest">{t("registerTitle")}</h1>
          <p className="mt-3 text-stone-700">{t("registerIntro")}</p>
          <div className="mt-8"><AuthForm mode="register" /></div>
          <p className="mt-6 text-sm text-stone-700">{t("haveAccount")} <Link href="/login" className="text-forest underline">{t("login")}</Link></p>
        </div>
      </div>
    </div>
  );
}
