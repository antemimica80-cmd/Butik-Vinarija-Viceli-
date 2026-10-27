import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/ui";
import { RoutePlanner } from "@/components/routes/RoutePlanner";
import { getCurrentUser } from "@/lib/auth";
import { pageMetadata, localizedPath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ stops?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "routes" });
  return pageMetadata({ title: t("plannerTitle"), description: t("plannerIntro"), href: "/routes/planner", locale, noindex: !!sp.stops });
}

export default async function PlannerPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, nav, user, sp] = await Promise.all([getTranslations("routes"), getTranslations("nav"), getCurrentUser(), searchParams]);
  const shared = (sp.stops ?? "").split(",").filter((s) => /^[a-z0-9-]{1,80}$/.test(s)).slice(0, 25);
  return (
    <div className="container-x pb-10 pt-8 md:pt-12">
      <Breadcrumbs items={[{ label: nav("routes"), href: "/routes", url: localizedPath("/routes", locale) }, { label: t("plannerTitle") }]} />
      <h1 className="mt-6 text-5xl text-forest md:text-6xl">{t("plannerTitle")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-stone-700">{t("plannerIntro")}</p>
      <div className="mt-10"><RoutePlanner loggedIn={!!user} sharedSlugs={shared} /></div>
    </div>
  );
}
