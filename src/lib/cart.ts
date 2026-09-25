'use client';

import { useSyncExternalStore } from 'react';
import { track } from '@/lib/analytics';

/**
 * The cart lives in localStorage (per browser). Prices are never stored here —
 * the server prices every checkout from the catalogue.
 */
export type CartLine = { sku: string; qty: number };

const KEY = 'vicelic_cart';
const EVENT = 'vicelic:cart';
const EMPTY: CartLine[] = [];

let cacheRaw: string | null = null;
let cacheLines: CartLine[] = EMPTY;

function readRaw(): string {
  try {
    return localStorage.getItem(KEY) ?? '[]';
  } catch {
    return '[]';
  }
}

function read(): CartLine[] {
  const raw = readRaw();
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      const parsed = JSON.parse(raw) as CartLine[];
      cacheLines = Array.isArray(parsed) ? parsed.filter((l) => typeof l.sku === 'string' && l.qty > 0) : EMPTY;
    } catch {
      cacheLines = EMPTY;
    }
  }
  return cacheLines;
}

export function writeCart(lines: CartLine[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines.filter((l) => l.qty > 0)));
  } catch {
    /* storage unavailable (private mode) — cart lives for this page only */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function addToCart(sku: string, qty = 1) {
  const lines = [...read()];
  const i = lines.findIndex((l) => l.sku === sku);
  if (i >= 0) lines[i] = { sku, qty: Math.min(99, lines[i].qty + qty) };
  else lines.push({ sku, qty });
  writeCart(lines);
  track({ name: 'add_to_cart', props: { sku, qty } });
}

export function setQty(sku: string, qty: number) {
  writeCart(read().map((l) => (l.sku === sku ? { sku, qty: Math.max(0, Math.min(99, qty)) } : l)));
}

export function clearCart() {
  writeCart([]);
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useCartCount() {
  return useCart().reduce((n, l) => n + l.qty, 0);
}
