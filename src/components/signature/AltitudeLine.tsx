'use client';

import { useEffect, useRef } from 'react';

type Station = { id: string; altitude: number; name: string };

/**
 * The descent: a thin vertical line fixed to the side of the page that counts
 * the altitude down (e.g. 350 m → 0 m) as the visitor scrolls from the ridge to the sea.
 * Stations are the page sections marked with data-station / data-altitude inside [data-descent].
 */
export function AltitudeLine({ stations, label }: { stations: Station[]; label: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const descent = document.querySelector<HTMLElement>('[data-descent]');
    if (!root || !descent) return;
    const top = stations[0].altitude;
    let raf = 0;

    const update = () => {
      raf = 0;
      const marks = Array.from(descent.querySelectorAll<HTMLElement>('[data-station]'));
      const y = window.scrollY + window.innerHeight * 0.5;
      const points = marks.map((el) => ({
        y: el.getBoundingClientRect().top + window.scrollY,
        alt: Number(el.dataset.altitude),
        id: el.dataset.station,
      }));
      const d = descent.getBoundingClientRect();
      const end = d.bottom + window.scrollY;
      points.push({ y: end, alt: 0, id: points.at(-1)?.id });

      let alt = top;
      let active = points[0]?.id;
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        if (y >= a.y) {
          active = a.id;
          const t = Math.min(1, (y - a.y) / (b.y - a.y));
          alt = a.alt + (b.alt - a.alt) * t;
        }
      }
      const visible = y > (points[0]?.y ?? 0) - window.innerHeight * 0.25 && window.scrollY + window.innerHeight * 0.2 < end;
      root.dataset.visible = String(visible);
      if (valueRef.current) valueRef.current.textContent = String(Math.round(alt));
      if (dotRef.current) dotRef.current.style.transform = `translateY(${(1 - alt / top) * 100}%)`;
      listRef.current?.querySelectorAll('li').forEach((li) => {
        li.dataset.active = String(li.dataset.id === active);
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [stations]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-visible="false"
      className="altitude pointer-events-none fixed top-1/2 left-2 z-20 flex -translate-y-1/2 items-stretch gap-3 mix-blend-difference text-bone md:left-5 lg:left-7"
    >
      <div className="relative h-[46vh] w-px bg-current/35">
        <span ref={dotRef} className="absolute inset-x-0 top-0 block h-full will-change-transform">
          <span className="absolute -left-[3px] top-0 block size-[7px] -translate-y-1/2 rounded-full bg-current" />
        </span>
      </div>
      <div className="hidden flex-col justify-between lg:flex">
        <p className="font-mono text-xs tabular-nums">
          <span ref={valueRef}>{stations[0].altitude}</span> m
          <span className="label mt-1 block text-[0.5625rem] opacity-60">{label}</span>
        </p>
        <ol ref={listRef} className="space-y-2">
          {stations.map((s) => (
            <li key={s.id} data-id={s.id} className="label text-[0.5625rem] transition-opacity duration-700">
              {s.name}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
