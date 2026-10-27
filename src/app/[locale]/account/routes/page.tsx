import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { AccountShell } from "@/components/account/AccountShell";
import { EmptyState } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { pageUser } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import { deleteRoute } from "@/app/actions/routes";
import { pick, type LocalizedText } from "@/lib/content";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false } };

export default async function SavedRoutesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageUser(locale, `/${locale}/${locale === "hr" ? "racun/rute" : "account/routes"}`);
  const [t, tr, fmt] = await Promise.all([getTranslations("account"), getTranslations("routes"), getFormatter()]);
  const routes = await sql<{ id: string; slug: string; title: LocalizedText; created_at: string; stops: string[] }[]>`
    select r.id, r.slug, r.title, r.created_at,
      coalesce((select array_agg(w.slug order by s.position) from wine_route_stops s join wineries w on w.id = s.winery_id where s.route_id = r.id), '{}') as stops
    from wine_routes r where r.user_id = ${user.id} order by r.created_at desc`;
  async function remove(fd: FormData) {
    "use server";
    await deleteRoute(String(fd.get("id")));
    revalidatePath("/[locale]/account/routes", "page");
  }
  return (
    <AccountShell user={user} active="routes">
      <h1 className="mb-8 text-5xl text-forest">{t("routes")}</h1>
      {routes.length ? (
        <ul className="space-y-3">
          {routes.map((r) => (
            <li key={r.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <Link href={{ pathname: "/routes/[slug]", params: { slug: r.slug } }} className="font-display text-2xl hover:text-forest">{pick(r.title, locale)}</Link>
                <p className="text-sm text-stone-700">{tr("stops", { count: r.stops.length })} · {fmt.dateTime(new Date(r.created_at), { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <Link href={{ pathname: "/routes/planner", query: { stops: r.stops.join(",") } }} className="btn btn-ghost btn-sm">{tr("loadIntoPlanner")}</Link>
              <form action={remove}><input type="hidden" name="id" value={r.id} /><button className="btn btn-ghost btn-sm text-burgundy">{t("deleteRoute")}</button></form>
            </li>
          ))}
        </ul>
      ) : <EmptyState icon="route" title={t("routesEmpty")} action={<Link href="/routes/planner" className="btn btn-primary">{tr("openPlanner")}</Link>} />}
    </AccountShell>
  );
}
