import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountShell } from "@/components/account/AccountShell";
import { LocalFavoritesImport } from "@/components/account/LocalFavoritesImport";
import { WineryGrid } from "@/components/WineryGrid";
import { EmptyState } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { pageUser } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import { searchWineries } from "@/lib/queries/wineries";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false } };

export default async function SavedPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageUser(locale, `/${locale}/${locale === "hr" ? "racun/spremljeno" : "account/saved"}`);
  const t = await getTranslations("account");
  const favs = await sql<{ slug: string }[]>`
    select w.slug from favorites f join wineries w on w.id = f.entity_id
    where f.user_id = ${user.id} and f.entity_type = 'winery' and w.status = 'published' order by f.created_at desc`;
  const { items } = await searchWineries({ slugs: favs.map((f) => f.slug), sort: "name" }, { pageSize: 200 });
  return (
    <AccountShell user={user} active="saved">
      <h1 className="mb-8 text-5xl text-forest">{t("saved")}</h1>
      <LocalFavoritesImport />
      {items.length ? <WineryGrid items={items} /> : <EmptyState icon="heart" title={t("savedEmpty")} action={<Link href="/wineries" className="btn btn-primary">{(await getTranslations("nav"))("wineries")}</Link>} />}
    </AccountShell>
  );
}
