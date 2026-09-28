'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocale } from 'next-intl';

type Item = { src: string; alt: string };

const t = {
  open: { en: 'Enlarge image', hr: 'Povećaj sliku' },
  close: { en: 'Close', hr: 'Zatvori' },
  prev: { en: 'Previous image', hr: 'Prethodna slika' },
  next: { en: 'Next image', hr: 'Sljedeća slika' },
};

/**
 * Click an image to see it full screen. Images that share a `group` (e.g. a wine's
 * gallery) can be paged with the arrows, the arrow keys or a swipe.
 */
export function Zoom({ src, alt, group, children }: Item & { group?: string; children: ReactNode }) {
  const locale = useLocale() as 'en' | 'hr';
  const dialog = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  function open() {
    const list = group
      ? [...document.querySelectorAll<HTMLElement>(`[data-zoom-group="${group}"]`)].map((el) => ({ src: el.dataset.zoomSrc!, alt: el.dataset.zoomAlt ?? '' }))
      : [{ src, alt }];
    setItems(list);
    setIndex(Math.max(0, list.findIndex((x) => x.src === src)));
    dialog.current?.showModal();
  }

  const close = () => dialog.current?.close();
  const step = (d: number) => setIndex((i) => (i + d + items.length) % items.length);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (items.length < 2) return;
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % items.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + items.length) % items.length);
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [items.length]);

  const current = items[index];
  const many = items.length > 1;

  return (
    <>
      <button
        type="button"
        onClick={open}
        data-zoom-group={group}
        data-zoom-src={src}
        data-zoom-alt={alt}
        aria-label={`${t.open[locale]}: ${alt}`}
        className="group/zoom relative block w-full cursor-zoom-in text-left"
      >
        {children}
        <span
          aria-hidden
          className="pointer-events-none absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-basalt/55 text-bone opacity-80 backdrop-blur-sm transition-opacity duration-300 group-hover/zoom:opacity-100"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6" />
          </svg>
        </span>
      </button>

      <dialog
        ref={dialog}
        aria-label={alt}
        className="zoom-dialog m-0 h-full max-h-none w-full max-w-none bg-transparent p-0"
        onClick={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.zoomClose !== undefined) close();
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null || !many) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <div data-zoom-close className="flex h-full w-full items-center justify-center bg-basalt/[0.97] p-4 md:p-10">
          {current && (
            // eslint-disable-next-line @next/next/no-img-element -- full-size original in a modal
            <img src={current.src} alt={current.alt} className="max-h-full max-w-full object-contain shadow-2xl" />
          )}
        </div>
        <button type="button" onClick={close} aria-label={t.close[locale]} className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-bone/10 text-bone hover:bg-bone/20">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        {many && (
          <>
            <button type="button" onClick={() => step(-1)} aria-label={t.prev[locale]} className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-bone/10 text-bone hover:bg-bone/20 md:left-6">
              <span aria-hidden>←</span>
            </button>
            <button type="button" onClick={() => step(1)} aria-label={t.next[locale]} className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-bone/10 text-bone hover:bg-bone/20 md:right-6">
              <span aria-hidden>→</span>
            </button>
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-xs text-bone/70">
              {index + 1} / {items.length}
            </p>
          </>
        )}
      </dialog>
    </>
  );
}
