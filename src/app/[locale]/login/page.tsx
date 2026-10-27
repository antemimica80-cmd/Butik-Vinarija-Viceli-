import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthForm } from "@/components/forms/AuthForm";
import { Landscape } from "@/components/Landscape";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ next?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return pageMetadata({ title: t("loginTitle"), description: t("loginIntro"), href: "/login", locale, noindex: true });
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, sp] = await Promise.all([getTranslations("auth"), searchParams]);
  return (
    <div className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block"><Landscape variant="istria" seed={4} className="absolute inset-0 h-full w-full" /></div>
      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-5xl text-forest">{t("loginTitle")}</h1>
          <p className="mt-3 text-stone-700">{t("loginIntro")}</p>
          <div className="mt-8"><AuthForm mode="login" next={sp.next} /></div>
          <p className="mt-6 text-sm text-stone-700">{t("noAccount")} <Link href="/register" className="text-forest underline">{t("register")}</Link></p>
        </div>
      </div>
    </div>
  );
}
