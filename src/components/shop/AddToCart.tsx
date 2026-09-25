'use client';

import { useEffect, useState } from 'react';
import { shopCopy as S } from '@content/products';
import type { Format } from '@content/products';
import { Link } from '@/i18n/navigation';
import { addToCart } from '@/lib/cart';
import { fill, formatEur } from '@/lib/format';
import { STATIC_PREVIEW } from '@/lib/static';

/** Format picker + quantity + add to cart, with live stock. */
export function AddToCart({ formats, locale }: { formats: Format[]; locale: 'en' | 'hr' }) {
  const l = (x: { en: string; hr: string }) => x[locale];
  const [sku, setSku] = useState(formats[0].sku);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [stock, setStock] = useState<Record<string, number> | null>(null);
  const format = formats.find((f) => f.sku === sku)!;

  useEffect(() => {
    if (STATIC_PREVIEW) return;
    fetch('/api/shop/stock', { cache: 'no-store' })
      .then((r) => r.json() as Promise<{ stock: Record<string, number> }>)
      .then((j) => setStock(j.stock))
      .catch(() => null);
  }, []);

  // How many of this format can still be bought, limited by the scarcest wine in it.
  const available = stock ? Math.min(...Object.entries(format.bottles).map(([w, n]) => Math.floor((stock[w] ?? 0) / n))) : 99;
  const soldOut = available < 1;

  return (
    <div>
      {formats.length > 1 && (
        <fieldset>
          <legend className="label text-ink-soft">{l(S.format)}</legend>
          <div className="mt-3 grid gap-2">
            {formats.map((f) => (
              <label
                key={f.sku}
                className={`flex cursor-pointer items-center justify-between gap-4 border px-4 py-3.5 transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 ${
                  f.sku === sku ? 'border-plavac bg-plavac text-bone' : 'border-basalt/20 bg-limestone hover:border-basalt/50'
                }`}
              >
                <input type="radio" name="format" value={f.sku} checked={f.sku === sku} onChange={() => { setSku(f.sku); setQty(1); setAdded(false); }} className="sr-only" />
                <span>{l(f.label)}</span>
                <span className="font-mono">{formatEur(f.price, locale)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 flex items-stretch gap-3">
        <div className="flex items-center border border-basalt/25" role="group" aria-label={l(S.quantity)}>
          <button type="button" className="inline-flex size-13 items-center justify-center text-lg disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label={`${l(S.quantity)} −`}>
            −
          </button>
          <output className="w-8 text-center font-mono text-lg" aria-live="polite">
            {qty}
          </output>
          <button type="button" className="inline-flex size-13 items-center justify-center text-lg disabled:opacity-30" onClick={() => setQty((q) => Math.min(available, q + 1))} disabled={qty >= available} aria-label={`${l(S.quantity)} +`}>
            +
          </button>
        </div>
        <button
          type="button"
          disabled={soldOut}
          onClick={() => {
            addToCart(sku, qty);
            setAdded(true);
          }}
          className="btn btn-primary min-w-0 flex-1 px-4 disabled:opacity-40"
        >
          {soldOut ? (
            l(S.soldOut)
          ) : added ? (
            `${l(S.added)} ✓`
          ) : (
            <>
              {l(S.add)}
              <span className="hidden font-mono tracking-normal xs:inline">· {formatEur(format.price * qty, locale)}</span>
            </>
          )}
        </button>
      </div>
      <div className="mt-3 flex min-h-6 items-center justify-between gap-4 text-sm" aria-live="polite">
        <span className="text-ink-soft">{!soldOut && available <= 12 ? fill(l(S.left), { n: available }) : l(S.vatIncl)}</span>
        {added && (
          <Link href="/shop/cart" className="btn-link">
            {l(S.viewCart)} →
          </Link>
        )}
      </div>
    </div>
  );
}
