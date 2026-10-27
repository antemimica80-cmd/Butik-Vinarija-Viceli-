import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "./Icon";
import { Landscape, regionVariant } from "./Landscape";
import { RegionDot } from "./ui";
import { pick, field, grapeName, type LocalizedContent, type LocalizedText } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import type { Locale } from "@/i18n/routing";

export type CardWinery = {
  id: number; slug: string; name: string; short: LocalizedContent; island: string | null;
  is_featured: boolean; is_sponsored: boolean; region_slug: string | null; region_name: LocalizedText; region_color: string | null;
  town: string | null; distance_km: number | null; grapes: { slug: string; name_hr: string; name_en: string }[];
  has_tasting: boolean; award_count: number; hero_path: string | null; logo_path: string | null;
};

/** Works in both server and client components. */
export function WineryCard({ w, variant = "default", selected = false, onHover }: {
  w: CardWinery; variant?: "default" | "compact" | "feature"; selected?: boolean; onHover?: (id: number | null) => void;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const hero = mediaUrl(w.hero_path);
  const logo = mediaUrl(w.logo_path);
  const short = field(w.short, "short", locale).text;
  const place = [w.town, w.island && w.island !== w.town ? w.island : null].filter(Boolean).join(", ");

  if (variant === "compact") {
    return (
      <Link href={{ pathname: "/wineries/[slug]", params: { slug: w.slug } }}
        onMouseEnter={onHover ? () => onHover(w.id) : undefined} onMouseLeave={onHover ? () => onHover(null) : undefined}
        onFocus={onHover ? () => onHover(w.id) : undefined}
        data-winery-id={w.id}
        className={`group flex gap-3 rounded-2xl border p-3 transition-all ${selected ? "border-forest bg-forest-100/60 shadow-soft" : "border-transparent hover:border-line hover:bg-paper"}`}>
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
          {hero ? <img src={hero} alt="" loading="lazy" className="h-full w-full object-cover" /> : <Landscape variant={regionVariant(w.region_slug)} seed={w.id} className="h-full w-full" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-xl leading-tight text-ink group-hover:text-forest">{w.name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-stone-700">
            <RegionDot color={w.region_color} className="h-2 w-2" /> {place || pick(w.region_name, locale)}
            {w.distance_km != null && <span>· {t("common.km", { value: w.distance_km })}</span>}
          </p>
          <p className="mt-1.5 flex flex-wrap gap-1">
            {w.grapes.slice(0, 2).map((g) => <span key={g.slug} className="chip !py-0.5 !text-[0.7rem]">{grapeName(g, locale)}</span>)}
            {w.has_tasting && <span className="chip chip-wine !py-0.5 !text-[0.7rem]">{t("wineries.card.tastings")}</span>}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-[1.4rem] border border-line bg-paper transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift ${variant === "feature" ? "" : ""}`}
      onMouseEnter={onHover ? () => onHover(w.id) : undefined} onMouseLeave={onHover ? () => onHover(null) : undefined}>
      <div className="relative aspect-[4/3] overflow-hidden">
        {hero ? (
          <img src={hero} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        ) : (
          <Landscape variant={regionVariant(w.region_slug)} seed={w.id} className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]" />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {w.is_sponsored && <span className="chip bg-ivory/95 !text-[0.72rem] font-medium">{t("common.sponsored")}</span>}
          {w.is_featured && variant === "feature" && <span className="chip bg-ivory/95 !text-[0.72rem] font-medium text-forest">{t("common.featured")}</span>}
        </div>
        {logo && <img src={logo} alt="" className="absolute bottom-3 left-3 h-12 w-12 rounded-full bg-ivory object-contain p-1.5 shadow-soft" />}
        {!hero && <span className="absolute bottom-2 right-3 text-[0.62rem] uppercase tracking-widest text-ivory/60">{t("common.illustration")}</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-700">
          <RegionDot color={w.region_color} /> {pick(w.region_name, locale)}
        </p>
        <h3 className="font-display text-[1.7rem] leading-[1.05] text-ink">
          <Link href={{ pathname: "/wineries/[slug]", params: { slug: w.slug } }} className="after:absolute after:inset-0 focus-visible:outline-none">
            {w.name}
          </Link>
        </h3>
        {place && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-stone-700">
            <Icon name="pin" size={15} /> {place}
            {w.distance_km != null && <span>· {t("common.km", { value: w.distance_km })}</span>}
          </p>
        )}
        {short && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone-700">{short}</p>}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {w.grapes.slice(0, 3).map((g) => <span key={g.slug} className="chip">{grapeName(g, locale)}</span>)}
          {w.has_tasting && <span className="chip chip-wine"><Icon name="glass" size={13} /> {t("wineries.card.tastings")}</span>}
          {w.award_count > 0 && <span className="chip chip-brass"><Icon name="medal" size={13} /> {t("wineries.card.awards", { count: w.award_count })}</span>}
        </div>
      </div>
    </article>
  );
}
