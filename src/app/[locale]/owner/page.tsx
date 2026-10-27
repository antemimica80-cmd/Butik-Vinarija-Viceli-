import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { pageUser } from "@/lib/page-auth";
import { isStaff } from "@/lib/auth";
import { managedWineries } from "@/lib/queries/owner";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false } };

export default async function OwnerHome({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageUser(locale, `/${locale}/${locale === "hr" ? "vlasnik" : "owner"}`);
  const [t, nav, list] = await Promise.all([getTranslations("owner"), getTranslations("nav"), managedWineries(user)]);
  return (
    <div className="container-x pb-10 pt-10">
      <h1 className="text-5xl text-forest">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-stone-700">{t("intro")}</p>
      {isStaff(user) && <p className="mt-4"><Link href="/admin/wineries" className="btn btn-ghost btn-sm"><Icon name="shield" size={15} /> {nav("admin")}</Link></p>}
      <div className="mt-8">
        {list.length ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {list.map((w) => (
              <li key={w.id}>
                <Link href={{ pathname: "/owner/[winery]", params: { winery: w.slug } }} className="card flex items-center justify-between gap-4 p-6 hover:border-forest">
                  <span><span className="block font-display text-3xl">{w.name}</span><span className="text-sm text-stone-700">{w.town}</span></span>
                  <span className={`chip ${w.new_inquiries ? "chip-wine" : ""}`}><Icon name="inbox" size={14} /> {t("newInquiries", { count: w.new_inquiries })}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <EmptyState icon="glass" title={t("noWineries")} action={<Link href="/claim" className="btn btn-primary">{t("claimCta")}</Link>} />}
      </div>
    </div>
  );
}
