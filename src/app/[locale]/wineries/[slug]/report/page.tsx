import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getWineryBySlug } from "@/lib/queries/profile";
import { issueFormToken } from "@/lib/security";
import { pageMetadata, localizedPath } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui";
import { SimpleForm } from "@/components/forms/SimpleForm";
import { submitReport } from "@/app/actions/public-forms";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "report" });
  return pageMetadata({ title: t("title"), description: t("title"), href: { pathname: "/wineries/[slug]/report", params: { slug } }, locale, noindex: true });
}

export default async function ReportPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const w = await getWineryBySlug(slug);
  if (!w) notFound();
  const [t, nav, tc] = await Promise.all([getTranslations("report"), getTranslations("nav"), getTranslations("common")]);
  const fields = ["general", "contact", "location", "wines", "awards", "visits"] as const;
  return (
    <div className="container-x max-w-2xl pb-10 pt-8 md:pt-12">
      <Breadcrumbs items={[
        { label: nav("wineries"), href: "/wineries", url: localizedPath("/wineries", locale) },
        { label: w.name, href: { pathname: "/wineries/[slug]", params: { slug } } },
        { label: t("title") },
      ]} />
      <h1 className="mt-6 text-5xl text-forest">{t("title")}</h1>
      <p className="mt-4 text-lg text-stone-700">{t("intro", { name: w.name })}</p>
      <div className="mt-8">
        <SimpleForm action={submitReport} submitLabel={t("submit")} successText={t("success")} errorText={t("error")} pendingLabel={tc("loading")}>
          <input type="hidden" name="wineryId" value={w.id} />
          <input type="hidden" name="formToken" value={issueFormToken()} />
          <div>
            <label className="field-label" htmlFor="field">{t("field")}</label>
            <select id="field" name="field" className="field">{fields.map((f) => <option key={f} value={f}>{t(`fieldOptions.${f}`)}</option>)}</select>
          </div>
          <div>
            <label className="field-label" htmlFor="message">{t("message")}</label>
            <textarea id="message" name="message" required minLength={5} maxLength={3000} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">{t("email")}</label>
            <input id="email" name="email" type="email" className="field" />
          </div>
        </SimpleForm>
      </div>
    </div>
  );
}
