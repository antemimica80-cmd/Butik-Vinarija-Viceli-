"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "./Icon";
import type { Suggestion } from "@/lib/queries/catalog";

type Props = { size?: "hero" | "default"; placeholder?: string; initial?: string; autoFocus?: boolean; onSubmitQuery?: (q: string) => void };

export function SearchBox({ size = "default", placeholder, initial = "", autoFocus, onSubmitQuery }: Props) {
  const t = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const listId = useId();
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { items: Suggestion[] };
        setItems(data.items);
        setActive(-1);
      } catch { /* aborted or offline */ } finally { setLoading(false); }
    }, 160);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Suggestions only apply to the current query (stale results are hidden, not cleared in an effect).
  const visibleItems = q.trim().length >= 2 ? items : [];
  const label = (s: Suggestion) => (locale === "en" ? s.labelEn ?? s.label : s.labelHr ?? s.label);

  function go(s: Suggestion) {
    setOpen(false);
    switch (s.kind) {
      case "winery": return router.push({ pathname: "/wineries/[slug]", params: { slug: s.slug } });
      case "region": return router.push({ pathname: "/regions/[region]", params: { region: s.slug } });
      case "subregion": return s.parent
        ? router.push({ pathname: "/regions/[region]/[subregion]", params: { region: s.parent, subregion: s.slug } })
        : router.push({ pathname: "/wineries", query: { subregion: s.slug } });
      case "district": return router.push({ pathname: "/districts/[slug]", params: { slug: s.slug } });
      case "site": return router.push({ pathname: "/sites/[slug]", params: { slug: s.slug } });
      case "grape": return router.push({ pathname: "/grapes/[slug]", params: { slug: s.slug } });
      case "wine": return router.push({ pathname: "/wines/[slug]", params: { slug: s.slug } });
      case "town": return router.push({ pathname: "/wineries", query: { town: s.slug } });
    }
  }

  function submit(useActive = true) {
    const term = q.trim();
    if (useActive && active >= 0 && items[active]) return go(items[active]);
    setOpen(false);
    if (onSubmitQuery) return onSubmitQuery(term);
    router.push({ pathname: "/wineries", query: term ? { q: term } : {} });
  }

  const hero = size === "hero";
  const showList = open && q.trim().length >= 2;

  return (
    <div ref={wrap} className="relative w-full">
      <form role="search" onSubmit={(e) => { e.preventDefault(); submit(true); }}
        className={`flex items-center gap-2 rounded-full border bg-paper/95 shadow-lift backdrop-blur transition-shadow focus-within:shadow-[0_0_0_4px_rgb(189_155_101_/_.35)] ${hero ? "border-transparent p-2 pl-5" : "border-line p-1.5 pl-4"}`}>
        <Icon name="search" size={hero ? 22 : 18} className="shrink-0 text-stone-700" />
        <label htmlFor={`${listId}-input`} className="sr-only">{t("label")}</label>
        <input
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          value={q}
          placeholder={placeholder ?? t("placeholder")}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, items.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
            else if (e.key === "Escape") { setOpen(false); setActive(-1); }
          }}
          className={`min-w-0 flex-1 bg-transparent text-ink placeholder:text-stone-700/80 focus:outline-none ${hero ? "h-12 text-[1.05rem] md:text-lg" : "h-10 text-[0.95rem]"}`}
        />
        <button type="submit" className={`btn btn-wine shrink-0 ${hero ? "h-12 px-6" : "btn-sm"}`}>
          <span className={hero ? "" : "sr-only sm:not-sr-only"}>{t("submit")}</span>
          {!hero && <Icon name="arrowRight" size={16} className="sm:hidden" />}
        </button>
      </form>
      {showList && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-line bg-paper text-ink shadow-lift fade-up">
          <ul id={listId} role="listbox" aria-label={t("label")} className="max-h-[22rem] overflow-y-auto py-2">
            {visibleItems.map((s, i) => (
              <li key={`${s.kind}-${s.slug}-${i}`} id={`${listId}-${i}`} role="option" aria-selected={i === active}
                onMouseDown={(e) => { e.preventDefault(); go(s); }} onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${i === active ? "bg-forest-100" : ""}`}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ivory text-forest">
                  <Icon name={s.kind === "winery" ? "glass" : s.kind === "grape" ? "grape" : s.kind === "wine" ? "bottle" : s.kind === "town" ? "pin" : "layers"} size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.95rem]">{label(s)}</span>
                  {s.sub && <span className="block truncate text-xs text-stone-700">{s.sub}</span>}
                </span>
                <span className="text-[0.68rem] font-medium uppercase tracking-wider text-stone-700">{t(`kinds.${s.kind}`)}</span>
              </li>
            ))}
            {!loading && visibleItems.length === 0 && <li className="px-4 py-3 text-sm text-stone-700">{t("noSuggestions")}</li>}
            <li role="option" aria-selected={false} onMouseDown={(e) => { e.preventDefault(); submit(false); }}
              className="mt-1 flex cursor-pointer items-center gap-2 border-t border-line px-4 py-3 text-sm text-forest hover:bg-ivory">
              <Icon name="search" size={15} /> {t("searchAllFor", { q: q.trim() })}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
