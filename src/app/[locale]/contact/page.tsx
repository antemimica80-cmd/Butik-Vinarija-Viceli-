import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ContentPage";
import { SimpleForm } from "@/components/forms/SimpleForm";
import { submitContact } from "@/app/actions/public-forms";
import { issueFormToken } from "@/lib/security";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMetadata({ title: t("metaTitle"), description: t("intro"), href: "/contact", locale });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc] = await Promise.all([getTranslations("contact"), getTranslations("common")]);
  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} />
      <div className="container-x max-w-2xl py-14">
        <SimpleForm action={submitContact} submitLabel={t("submit")} successText={t("success")} errorText={t("error")} pendingLabel={tc("loading")}>
          <input type="hidden" name="formToken" value={issueFormToken()} />
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="field-label" htmlFor="name">{t("name")}</label><input id="name" name="name" required className="field" autoComplete="name" /></div>
            <div><label className="field-label" htmlFor="email">{t("email")}</label><input id="email" name="email" type="email" required className="field" autoComplete="email" /></div>
          </div>
          <div><label className="field-label" htmlFor="subject">{t("subject")}</label><input id="subject" name="subject" className="field" /></div>
          <div><label className="field-label" htmlFor="message">{t("message")}</label><textarea id="message" name="message" required minLength={5} className="field" /></div>
        </SimpleForm>
      </div>
    </>
  );
}
