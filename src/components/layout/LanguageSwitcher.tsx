"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";

/** Switches language while staying on the equivalent page (same params and query). */
export function LanguageSwitcher({ label, short, light = false }: { label: string; short: string; light?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const search = useSearchParams();
  const [pending, start] = useTransition();
  const target = locale === "hr" ? "en" : "hr";

  return (
    <button
      type="button"
      lang={target}
      disabled={pending}
      onClick={() => {
        const query = Object.fromEntries(search.entries());
        const { locale: _l, ...rest } = params as Record<string, string>;
        void _l;
        start(() => {
          router.replace(
            // @ts-expect-error -- pathname and params come from the current route and are always compatible
            { pathname, params: rest, query },
            { locale: target, scroll: false },
          );
        });
      }}
      className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors ${
        light ? "border-ivory/40 hover:bg-ivory/10" : "border-line hover:border-stone hover:bg-paper"
      }`}
      aria-label={label}
      title={label}
    >
      <span aria-hidden>{short}</span>
    </button>
  );
}
