import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "./Icon";
import { SITE_URL } from "@/lib/site";
import type { Source } from "@/lib/queries/profile";

export function SectionHeading({ eyebrow, title, intro, action, id, light = false }: { eyebrow?: string; title: string; intro?: string; action?: ReactNode; id?: string; light?: boolean }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className={`eyebrow mb-3 ${light ? "eyebrow-light" : ""}`}>{eyebrow}</p>}
        <h2 id={id} className={`text-4xl md:text-5xl ${light ? "text-ivory" : "text-forest"}`}>{title}</h2>
        {intro && <p className={`mt-4 text-base leading-relaxed md:text-lg ${light ? "text-ivory/80" : "text-stone-700"}`}>{intro}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function RegionDot({ color, className = "" }: { color?: string | null; className?: string }) {
  return <span aria-hidden className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${className}`} style={{ background: color ?? "#193C34" }} />;
}

export async function VerificationBadge({ state, date, compact = false }: { state: string; date?: string | null; compact?: boolean }) {
  const t = await getTranslations("verification");
  const strong = state === "editor_verified" || state === "officially_verified";
  const key = state as "unverified" | "owner_submitted" | "third_party_sourced" | "editor_verified" | "officially_verified";
  return (
    <span className={`chip ${strong ? "chip-forest" : state === "unverified" ? "" : "chip-brass"}`} title={t(`explain_${key}`)}>
      <Icon name={strong ? "shield" : "info"} size={14} />
      {t(key)}
      {!compact && date && <span className="text-xs opacity-75">· {new Date(date).toLocaleDateString()}</span>}
    </span>
  );
}

export async function SourceList({ sources }: { sources: Source[] }) {
  const t = await getTranslations("winery");
  if (!sources.length) return <p className="text-sm text-stone-700">{t("noSources")}</p>;
  return (
    <ul className="space-y-2 text-sm">
      {sources.map((s) => (
        <li key={s.id} className="flex items-start gap-2">
          <Icon name="book" size={16} className="mt-0.5 shrink-0 text-brass-700" />
          {s.url ? (
            <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-forest underline decoration-line underline-offset-4 hover:decoration-forest">
              {s.name}
            </a>
          ) : (
            <span>{s.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export async function DraftNotice({ status, fallback }: { status?: string | null; fallback?: boolean }) {
  const t = await getTranslations("common");
  if (!fallback && status !== "draft") return null;
  return (
    <p className="mt-3 flex items-start gap-2 text-xs text-stone-700">
      <Icon name="info" size={14} className="mt-0.5 shrink-0" />
      <span>{[fallback ? t("fallbackLanguage") : null, status === "draft" ? t("draftContent") : null].filter(Boolean).join(" ")}</span>
    </p>
  );
}

export type Crumb = { label: string; href?: Parameters<typeof Link>[0]["href"]; url?: string };

/** Visible breadcrumbs plus schema.org BreadcrumbList. `url` must be the absolute localized URL. */
export function Breadcrumbs({ items, light = false }: { items: Crumb[]; light?: boolean }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: c.url ? `${SITE_URL}${c.url}` : undefined })),
  };
  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${light ? "text-ivory/80" : "text-stone-700"}`}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <Icon name="chevronRight" size={14} className="opacity-60" />}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="link-underline hover:text-current">{c.label}</Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined} className={i === items.length - 1 ? (light ? "text-ivory" : "text-ink") : ""}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
      <JsonLd data={ld} />
    </nav>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function EmptyState({ icon = "compass", title, body, action }: { icon?: IconName; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="card topo-bg flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-forest-100 text-forest"><Icon name={icon} /></span>
      <h3 className="text-2xl text-forest">{title}</h3>
      {body && <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-700">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-line py-3 first:border-t-0">
      <dt className="text-xs font-medium uppercase tracking-wider text-stone-700">{label}</dt>
      <dd className="mt-1 text-[0.95rem]">{children}</dd>
    </div>
  );
}

export function LevelMeter({ value, label }: { value: number | null; label: string }) {
  if (value == null) return null;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-stone-700"><span>{label}</span><span>{value}/5</span></div>
      <div className="flex gap-1" role="img" aria-label={`${label}: ${value}/5`}>
        {[1, 2, 3, 4, 5].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= value ? "bg-burgundy" : "bg-line"}`} />)}
      </div>
    </div>
  );
}
