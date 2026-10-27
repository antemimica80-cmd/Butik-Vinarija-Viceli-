"use client";

import { useRef, useState, type ReactNode } from "react";

const SNAPS = [0.18, 0.5, 0.9]; // fraction of container height

/** Draggable bottom sheet (mobile). Keyboard users can toggle size with the handle button. */
export function BottomSheet({ children, handleLabel, snap, onSnap }: { children: ReactNode; handleLabel: string; snap: number; onSnap: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startH: number } | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  const parentH = () => ref.current?.parentElement?.clientHeight ?? window.innerHeight;

  const onDown = (e: React.PointerEvent) => {
    drag.current = { startY: e.clientY, startH: ref.current?.getBoundingClientRect().height ?? 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const h = Math.min(Math.max(drag.current.startH + (drag.current.startY - e.clientY), 80), parentH() * 0.95);
    setHeight(h);
  };
  const onUp = () => {
    if (!drag.current) return;
    const frac = (ref.current?.getBoundingClientRect().height ?? 0) / parentH();
    let best = 0;
    SNAPS.forEach((s, i) => { if (Math.abs(s - frac) < Math.abs(SNAPS[best] - frac)) best = i; });
    drag.current = null;
    setHeight(null);
    onSnap(best);
  };

  return (
    <div ref={ref}
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-[1.6rem] border-t border-line bg-ivory shadow-[0_-12px_40px_-16px_rgba(0,0,0,.35)] transition-[height] duration-300 ease-out"
      style={{ height: height ?? `${SNAPS[snap] * 100}%`, transitionDuration: height != null ? "0ms" : undefined }}>
      <button type="button" aria-label={handleLabel}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        onClick={() => { if (!drag.current) onSnap((snap + 1) % SNAPS.length); }}
        className="flex h-7 w-full shrink-0 touch-none items-center justify-center">
        <span className="h-1.5 w-12 rounded-full bg-stone/50" />
      </button>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </div>
  );
}
