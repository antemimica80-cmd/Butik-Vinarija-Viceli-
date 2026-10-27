import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "./Icon";
import type { AppPathnames } from "@/i18n/routing";

/** Crawlable numbered pagination for list pages without dynamic params. */
export async function Pagination({ pathname, query, page, pages }: { pathname: Exclude<AppPathnames, `${string}[${string}`>; query: Record<string, string>; page: number; pages: number }) {
  if (pages <= 1) return null;
  const t = await getTranslations("common");
  const href = (p: number) => ({ pathname, query: { ...query, ...(p > 1 ? { page: String(p) } : {}) } });
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2);
  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && <Link rel="prev" href={href(page - 1) as never} className="btn btn-ghost btn-sm"><Icon name="chevronLeft" size={16} />{t("previous")}</Link>}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && nums[i - 1] !== n - 1 && <span className="text-stone-700">…</span>}
          <Link href={href(n) as never} aria-current={n === page ? "page" : undefined}
            className={`grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm ${n === page ? "bg-forest text-ivory" : "hover:bg-paper"}`}>{n}</Link>
        </span>
      ))}
      {page < pages && <Link rel="next" href={href(page + 1) as never} className="btn btn-ghost btn-sm">{t("next")}<Icon name="chevronRight" size={16} /></Link>}
    </nav>
  );
}
