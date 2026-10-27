import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { WineryProfileFields, loadProfileDefaults } from "@/components/owner/WineryProfileFields";
import { ActionForm } from "@/components/forms/ActionForm";
import { pageWineryManager } from "@/lib/page-auth";
import { wineryForOwner } from "@/lib/queries/owner";
import { saveProfile } from "@/app/actions/owner";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false } };

export default async function OwnerProfilePage({ params }: { params: Promise<{ locale: Locale; winery: string }> }) {
  const { locale, winery } = await params;
  setRequestLocale(locale);
  const w = await wineryForOwner(winery);
  if (!w) notFound();
  await pageWineryManager(locale, w.id, `/${locale}/owner/${winery}/profile`);
  const [t, tf, d] = await Promise.all([getTranslations("owner"), getTranslations("form"), loadProfileDefaults(w.id)]);
  return (
    <OwnerShell winery={w} active="profile">
      <p className="mb-6 rounded-xl bg-brass-100 p-4 text-sm text-brass-700">{t("reviewNote")}</p>
      <ActionForm action={saveProfile} submitLabel={tf("save")} messages={{ submitted: t("profileSaved"), published: t("profileSavedDirect"), error: tf("error"), pending: tf("saving") }} className="space-y-8">
        <input type="hidden" name="wineryId" value={w.id} />
        <WineryProfileFields d={d} />
      </ActionForm>
    </OwnerShell>
  );
}
