"use client";

import { useEffect, useState } from "react";

/** Sticky in-page navigation with scroll-spy for long profiles. */
export function StickyNav({ items, label }: { items: { id: string; label: string }[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    items.forEach((i) => { const el = document.getElementById(i.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [items]);
  return (
    <nav aria-label={label} className="sticky top-16 z-30 border-b border-line bg-ivory/92 backdrop-blur-md md:top-[4.5rem]">
      <ul className="container-x flex gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
        {items.map((i) => (
          <li key={i.id} className="shrink-0">
            <a href={`#${i.id}`} aria-current={active === i.id ? "true" : undefined}
              className={`block rounded-full px-3.5 py-2 text-sm transition-colors ${active === i.id ? "bg-forest text-ivory" : "text-stone-700 hover:bg-paper hover:text-ink"}`}>
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
