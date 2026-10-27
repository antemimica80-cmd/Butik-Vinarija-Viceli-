"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "../Icon";

export type GalleryImage = { src: string; alt: string; caption?: string; credit?: string | null };

/** Image grid with an accessible lightbox (Esc to close, arrow keys to navigate). */
export function Gallery({ images }: { images: GalleryImage[] }) {
  const t = useTranslations("common");
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prev = useCallback(() => setOpen((i) => (i == null ? i : (i - 1 + images.length) % images.length)), [images.length]);
  const next = useCallback(() => setOpen((i) => (i == null ? i : (i + 1) % images.length)), [images.length]);

  useEffect(() => {
    if (open == null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, prev, next]);

  if (!images.length) return null;
  const cur = open != null ? images[open] : null;
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((img, i) => (
          <li key={img.src} className={i === 0 ? "col-span-2 row-span-2" : ""}>
            <button type="button" onClick={() => setOpen(i)} className="group block h-full w-full overflow-hidden rounded-2xl">
              <img src={img.src} alt={img.alt} loading="lazy" className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            </button>
          </li>
        ))}
      </ul>
      {cur && (
        <div role="dialog" aria-modal="true" aria-label={cur.alt} className="fixed inset-0 z-[80] flex flex-col bg-black/92 text-ivory">
          <div className="flex justify-end p-3">
            <button ref={closeRef} type="button" onClick={() => setOpen(null)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10" aria-label={t("close")}><Icon name="x" /></button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center gap-2 px-2">
            <button type="button" onClick={prev} className="hidden h-12 w-12 place-items-center rounded-full hover:bg-white/10 sm:grid" aria-label={t("previous")}><Icon name="chevronLeft" /></button>
            <figure className="flex max-h-full min-w-0 flex-col items-center">
              <img src={cur.src} alt={cur.alt} className="max-h-[78vh] max-w-full rounded-lg object-contain" />
              <figcaption className="mt-3 text-center text-sm text-ivory/80">
                {cur.caption}{cur.credit && <span className="block text-xs text-ivory/55">© {cur.credit}</span>}
              </figcaption>
            </figure>
            <button type="button" onClick={next} className="hidden h-12 w-12 place-items-center rounded-full hover:bg-white/10 sm:grid" aria-label={t("next")}><Icon name="chevronRight" /></button>
          </div>
          <p className="p-3 text-center text-xs text-ivory/60">{(open ?? 0) + 1} / {images.length}</p>
        </div>
      )}
    </>
  );
}
