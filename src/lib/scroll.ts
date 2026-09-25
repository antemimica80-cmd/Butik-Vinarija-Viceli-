'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Calls `onFrame` (at most once per animation frame) with the element's scroll
 * progress: 0 when its top reaches the top of the viewport, 1 when its bottom
 * reaches the bottom. Writes go straight to the DOM — no React re-renders.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, onFrame: (progress: number) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const p = range > 0 ? -rect.top / range : rect.top < 0 ? 1 : 0;
      onFrame(Math.min(1, Math.max(0, p)));
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
    // onFrame is expected to be stable (writes to refs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Map p from [a, b] to [0, 1], clamped. */
export function range(p: number, a: number, b: number) {
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}
