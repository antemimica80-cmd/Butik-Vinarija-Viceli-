import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { AccountShell } from "@/components/account/AccountShell";
import { pageUser } from "@/lib/page-auth";
import { updatePreferences } from "@/app/actions/auth";
import { sql } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false } };

export default async function AccountPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageUser(locale, `/${locale}/${locale === "hr" ? "racun" : "account"}`);
  const [t, tl] = await Promise.all([getTranslations("account"), getTranslations("language")]);
  const [[counts]] = await Promise.all([sql<{ favs: number; routes: number; visits: number }[]>`
    select (select count(*)::int from favorites where user_id = ${user.id}) as favs,
           (select count(*)::int from wine_routes where user_id = ${user.id}) as routes,
           (select count(*)::int from winery_visits where user_id = ${user.id}) as visits`]);
  async function save(fd: FormData) {
    "use server";
    await updatePreferences(fd);
    revalidatePath("/[locale]/account", "page");
  }
  return (
    <AccountShell user={user} active="overview">
      <h1 className="text-5xl text-forest">{t("title")}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[{ n: counts.favs, l: t("saved"), h: "/account/saved" as const }, { n: counts.routes, l: t("routes"), h: "/account/routes" as const }, { n: counts.visits, l: t("passport"), h: "/account/passport" as const }].map((c) => (
          <Link key={c.h} href={c.h} className="card p-5 hover:border-forest"><span className="block font-display text-4xl text-forest">{c.n}</span><span className="text-sm text-stone-700">{c.l}</span></Link>
        ))}
      </div>
      <section className="card mt-10 max-w-lg p-6">
        <h2 className="font-display text-2xl">{t("preferences")}</h2>
        <form action={save} className="mt-4 space-y-4">
          <div><label className="field-label" htmlFor="name">{(await getTranslations("auth"))("name")}</label><input id="name" name="name" defaultValue={user.name ?? ""} className="field" /></div>
          <div>
            <label className="field-label" htmlFor="locale">{t("language")}</label>
            <select id="locale" name="locale" defaultValue={user.locale} className="field"><option value="hr">{tl("hr")}</option><option value="en">{tl("en")}</option></select>
          </div>
          <button className="btn btn-primary">{t("savePrefs")}</button>
        </form>
        <p className="mt-4 text-xs text-stone-700">{t("privacyNote")}</p>
      </section>
    </AccountShell>
  );
}
