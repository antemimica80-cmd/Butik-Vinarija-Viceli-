'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { shopCopy as S } from '@content/products';
import { zones } from '@content/shipping';
import type { ImageSlotId } from '@content/image-slots';
import { Link } from '@/i18n/navigation';
import { setQty, useCart } from '@/lib/cart';
import { priceCart } from '@/lib/shop/catalog';
import { fill, formatEur } from '@/lib/format';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { STATIC_PREVIEW, staticNotice } from '@/lib/static';

export function CartView({ locale, demo }: { locale: 'en' | 'hr'; demo: boolean }) {
  const l = (x: { en: string; hr: string }) => x[locale];
  const C = S.checkout;
  const cart = useCart();
  const [country, setCountry] = useState('HR');
  const [status, setStatus] = useState<{ kind: 'idle' | 'loading' } | { kind: 'error'; message: string; fields?: string[] }>({ kind: 'idle' });
  const priced = useMemo(() => priceCart(cart, country === 'OTHER' ? undefined : country), [cart, country]);
  const money = (n: number) => formatEur(n, locale);
  const hr = zones.find((z) => z.id === 'hr')!;

  // Returning from an abandoned Stripe payment: cancel that pending order.
  useEffect(() => {
    if (STATIC_PREVIEW) return;
    const p = new URLSearchParams(location.search);
    const o = p.get('cancelled');
    const t = p.get('t');
    if (o && t) {
      fetch('/api/shop/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ o, t }) }).catch(() => null);
      history.replaceState(null, '', location.pathname);
    }
  }, []);

  const countries = useMemo(() => {
    const names = new Intl.DisplayNames([locale === 'hr' ? 'hr' : 'en'], { type: 'region' });
    const eu = zones.find((z) => z.id === 'eu' && z.enabled)?.countries ?? [];
    const list = eu.map((c) => ({ code: c, name: names.of(c) ?? c })).sort((a, b) => a.name.localeCompare(b.name, locale));
    return { hr: hr.enabled ? { code: 'HR', name: names.of('HR')! } : null, eu: list };
  }, [locale, hr.enabled]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (STATIC_PREVIEW) {
      setStatus({ kind: 'error', message: l(staticNotice) });
      return;
    }
    setStatus({ kind: 'loading' });
    try {
      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: cart,
          country,
          name: f.get('name'),
          email: f.get('email'),
          phone: f.get('phone'),
          street: f.get('street') ?? '',
          postal: f.get('postal') ?? '',
          city: f.get('city') ?? '',
          notes: f.get('notes') ?? '',
          terms: f.get('terms') === 'on',
          website: f.get('website'),
          locale,
        }),
      });
      const json = (await res.json()) as { url?: string; error?: keyof typeof C.errors; fields?: string[] };
      if (json.url) return location.assign(json.url);
      setStatus({ kind: 'error', message: l(C.errors[json.error ?? 'generic'] ?? C.errors.generic), fields: json.fields });
    } catch {
      setStatus({ kind: 'error', message: l(C.errors.generic) });
    }
  }

  if (cart.length === 0 || priced.lines.length === 0) {
    return (
      <div className="py-10">
        <p className="text-lede text-ink-soft">{l(S.cart.empty)}</p>
        <Link href="/wines" className="btn btn-primary mt-8">
          {l(S.cart.browse)}
        </Link>
      </div>
    );
  }

  const bad = (f: string) => status.kind === 'error' && status.fields?.includes(f);
  const input = (f: string) => `mt-1.5 w-full border bg-transparent px-3 py-3 outline-none focus:border-basalt ${bad(f) ? 'border-plavac' : 'border-basalt/25'}`;
  const pickup = country === 'PICKUP';
  const unavailable = country === 'OTHER' || !priced.zone || priced.overZoneLimit;

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      {/* Lines */}
      <ul className="lg:col-span-7">
        {priced.lines.map((line) => (
          <li key={line.sku} className="grid grid-cols-[4rem_1fr_auto] items-center gap-5 border-b border-basalt/15 py-5 first:border-t">
            <ImageSlot id={line.product.bottleSlot as ImageSlotId} bare sizes="64px" />
            <div>
              <p className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                {line.product.name}
              </p>
              <p className="text-sm text-ink-soft">
                {l(line.format.label)} · {money(line.format.price)}
              </p>
              <div className="mt-2 flex items-center gap-1">
                <button type="button" onClick={() => setQty(line.sku, line.qty - 1)} className="inline-flex size-9 items-center justify-center border border-basalt/20" aria-label={`${line.product.name} −`}>
                  −
                </button>
                <span className="w-8 text-center font-mono">{line.qty}</span>
                <button type="button" onClick={() => setQty(line.sku, line.qty + 1)} className="inline-flex size-9 items-center justify-center border border-basalt/20" aria-label={`${line.product.name} +`}>
                  +
                </button>
                <button type="button" onClick={() => setQty(line.sku, 0)} className="ml-3 text-xs text-ink-soft underline underline-offset-4">
                  {l(S.cart.remove)}
                </button>
              </div>
            </div>
            <p className="font-mono">{money(line.lineTotal)}</p>
          </li>
        ))}
        <li className="pt-4 text-sm text-ink-soft">
          {fill(l(S.cart.bottles), { n: priced.bottles })}
          {hr.freeFromBottles && ` · ${fill(l(S.cart.freeFrom), { n: hr.freeFromBottles })}`}
        </li>
      </ul>

      {/* Checkout */}
      <form onSubmit={submit} noValidate className="lg:col-span-5">
        <div className="bg-bone p-6 ring-1 ring-basalt/10 sm:p-8">
          <label htmlFor="c-country" className="label text-ink-soft">
            {l(C.delivery)}
          </label>
          <select id="c-country" value={country} onChange={(e) => setCountry(e.target.value)} className={`${input('country')} bg-limestone`}>
            {countries.hr && <option value="HR">{countries.hr.name}</option>}
            <option value="PICKUP">{l(C.pickup)}</option>
            <optgroup label={locale === 'hr' ? 'Europska unija' : 'European Union'}>
              {countries.eu.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </optgroup>
            <option value="OTHER">{l(C.other)}</option>
          </select>
          {unavailable && (
            <p className="mt-3 border-l-2 border-plavac pl-3 text-sm" role="status">
              {l(C.notAvailable)}
            </p>
          )}

          <dl className="mt-6 space-y-2 border-t border-basalt/15 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">{l(S.cart.subtotal)}</dt>
              <dd className="font-mono">{money(priced.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">{l(S.cart.shipping)}</dt>
              <dd className="font-mono">{unavailable ? '—' : priced.shipping === 0 ? l(S.cart.free) : money(priced.shipping)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-basalt/15 pt-3">
              <dt className="label">{l(S.cart.total)}</dt>
              <dd className="text-display-s font-light">{money(priced.total)}</dd>
            </div>
            <p className="text-right text-xs text-ink-soft">{fill(l(S.cart.vatNote), { vat: money(priced.vat) })}</p>
          </dl>

          <fieldset disabled={unavailable} className="mt-6 space-y-4 disabled:opacity-40">
            <div>
              <label htmlFor="c-name" className="text-sm text-ink-soft">
                {l(C.name)} *
              </label>
              <input id="c-name" name="name" autoComplete="name" required className={input('name')} />
            </div>
            <div>
              <label htmlFor="c-email" className="text-sm text-ink-soft">
                {l(C.email)} *
              </label>
              <input id="c-email" name="email" type="email" autoComplete="email" required className={input('email')} />
            </div>
            <div>
              <label htmlFor="c-phone" className="text-sm text-ink-soft">
                {l(C.phone)} {!pickup && '*'}
              </label>
              <input id="c-phone" name="phone" type="tel" autoComplete="tel" className={input('phone')} />
              {!pickup && <p className="mt-1 text-xs text-ink-soft">{l(C.phoneHint)}</p>}
            </div>
            {!pickup && (
              <>
                <div>
                  <label htmlFor="c-street" className="text-sm text-ink-soft">
                    {l(C.street)} *
                  </label>
                  <input id="c-street" name="street" autoComplete="street-address" className={input('street')} />
                </div>
                <div className="grid grid-cols-[8rem_1fr] gap-3">
                  <div>
                    <label htmlFor="c-postal" className="text-sm text-ink-soft">
                      {l(C.postal)} *
                    </label>
                    <input id="c-postal" name="postal" autoComplete="postal-code" className={input('postal')} />
                  </div>
                  <div>
                    <label htmlFor="c-city" className="text-sm text-ink-soft">
                      {l(C.city)} *
                    </label>
                    <input id="c-city" name="city" autoComplete="address-level2" className={input('city')} />
                  </div>
                </div>
                <div>
                  <label htmlFor="c-notes" className="text-sm text-ink-soft">
                    {l(C.notes)}
                  </label>
                  <input id="c-notes" name="notes" className={input('notes')} />
                </div>
              </>
            )}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <label className={`flex gap-3 text-sm leading-relaxed ${bad('terms') ? 'text-plavac' : 'text-ink-soft'}`}>
              <input type="checkbox" name="terms" className="mt-1 size-4 shrink-0 accent-[var(--color-plavac)]" />
              <span>
                {l(C.terms).split('{terms}')[0]}
                <Link href={{ pathname: '/legal/[slug]', params: { slug: 'terms' } }} target="_blank" className="underline underline-offset-4">
                  {l(C.termsLink)}
                </Link>
                {l(C.terms).split('{terms}')[1]}
              </span>
            </label>
          </fieldset>

          <button type="submit" disabled={unavailable || status.kind === 'loading'} className="btn btn-primary mt-6 w-full disabled:opacity-40">
            {status.kind === 'loading' ? l(C.paying) : fill(l(C.pay), { total: money(priced.total) })}
          </button>
          <p className="mt-3 text-center text-xs text-ink-soft">
            {demo ? (locale === 'hr' ? 'Demo način — ne naplaćuje se stvarno.' : 'Demo mode — no real payment is taken.') : locale === 'hr' ? 'Kartica, Apple Pay ili Google Pay · Stripe' : 'Card, Apple Pay or Google Pay · Stripe'}
          </p>
          <div aria-live="assertive">
            {status.kind === 'error' && (
              <p className="mt-4 border-l-2 border-plavac pl-3 text-sm" role="alert">
                {status.message}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
