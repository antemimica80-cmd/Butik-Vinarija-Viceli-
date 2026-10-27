import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "./Wordmark";

export async function SiteFooter() {
  const [t, nav, c] = await Promise.all([getTranslations("footer"), getTranslations("nav"), getTranslations("common")]);
  const cols = [
    { title: nav("explore"), links: [["/wineries", nav("wineries")], ["/map", nav("map")], ["/experiences", nav("experiences")], ["/routes", nav("routes")], ["/routes/planner", nav("planner")]] },
    { title: nav("learn"), links: [["/regions", nav("regions")], ["/grapes", nav("grapes")], ["/wines", nav("wines")], ["/awards", nav("awards")], ["/stories", nav("stories")]] },
    { title: nav("forWineries"), links: [["/list-your-winery", nav("listWinery")], ["/claim", nav("owner")], ["/about", nav("about")], ["/coverage", nav("coverage")], ["/contact", nav("contact")]] },
  ] as const;
  return (
    <footer className="relative mt-24 overflow-hidden bg-forest text-ivory">
      <div className="topo-bg absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Wordmark light label={c("siteName")} />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/75">{t("about")}</p>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-ivory/60">{t("dataNote")}</p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h2 className="eyebrow eyebrow-light mb-4 font-sans">{col.title}</h2>
            <ul className="space-y-2.5 text-sm">
              {col.links.map(([href, label]) => (
                <li key={href}><Link href={href} className="link-underline text-ivory/85 hover:text-ivory">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative border-t border-ivory/10">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-ivory/60 md:flex-row md:items-center md:justify-between">
          <p>{t("rights", { year: new Date().getFullYear() })} · {t("drinkResponsibly")}</p>
          <p className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-ivory">{t("privacy")}</Link>
            <Link href="/terms" className="hover:text-ivory">{t("terms")}</Link>
            <span>{t("mapData")}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
