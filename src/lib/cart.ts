'use client';

import { useSyncExternalStore } from 'react';

/**
 * Minimal cart store (localStorage). The full cart arrives in stage 6;
 * the header already subscribes so the badge updates everywhere.
 */
export type CartLine = { sku: string; qty: number };

const KEY = 'vicelic_cart';
const EVENT = 'vicelic:cart';

function read(): CartLine[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as CartLine[];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* storage unavailable (private mode) — cart lives for this page only */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

export function useCartCount() {
  return useSyncExternalStore(
    subscribe,
    () => read().reduce((n, l) => n + l.qty, 0),
    () => 0,
  );
}
