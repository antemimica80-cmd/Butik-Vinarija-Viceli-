import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPathname } from '@/i18n/navigation';
import { priceCart } from '@/lib/shop/catalog';
import { createOrder, getStock, setOrderSession, shortOf, cancelOrder, type Address } from '@/lib/shop/store';
import { siteUrl, stripe, stripeEnabled } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const body = z
  .object({
    lines: z.array(z.object({ sku: z.string().max(40), qty: z.number().int().min(1).max(99) })).min(1).max(20),
    country: z.string().regex(/^([A-Z]{2}|PICKUP)$/),
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().max(40).default(''),
    street: z.string().trim().max(160).default(''),
    postal: z.string().trim().max(20).default(''),
    city: z.string().trim().max(80).default(''),
    notes: z.string().trim().max(500).default(''),
    locale: z.enum(['en', 'hr']),
    terms: z.literal(true),
    website: z.string().max(0).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.country === 'PICKUP') return;
    for (const f of ['street', 'postal', 'city'] as const) if (v[f].length < 2) ctx.addIssue({ code: 'custom', path: [f], message: 'required' });
    if (v.phone.length < 6) ctx.addIssue({ code: 'custom', path: ['phone'], message: 'required for courier' });
  });

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid', fields: parsed.error.issues.map((i) => i.path.join('.')) }, { status: 400 });
  const v = parsed.data;

  // Prices, shipping and VAT are always recomputed here — never trusted from the browser.
  const priced = priceCart(v.lines, v.country);
  if (priced.lines.length === 0) return NextResponse.json({ error: 'invalid', fields: ['lines'] }, { status: 400 });
  if (!priced.zone || priced.overZoneLimit) return NextResponse.json({ error: 'zone' }, { status: 400 });
  const short = shortOf(priced.bottlesByWine, await getStock());
  if (short.length) return NextResponse.json({ error: 'out_of_stock', wines: short }, { status: 409 });

  const mode = stripeEnabled() ? 'stripe' : 'demo';
  const address: Address = v.country === 'PICKUP' ? { pickup: true } : { street: v.street, postal: v.postal, city: v.city, country: v.country };
  const order = await createOrder({ priced, country: v.country, name: v.name, email: v.email, phone: v.phone, address, notes: v.notes, locale: v.locale, paymentMode: mode });
  const q = `?o=${order.id}&t=${order.token}`;
  const ordered = `${siteUrl()}${getPathname({ locale: v.locale, href: '/shop/ordered' })}${q}`;

  if (mode === 'demo') return NextResponse.json({ url: `${siteUrl()}${getPathname({ locale: v.locale, href: '/shop/checkout' })}${q}`, mode });

  try {
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      locale: v.locale,
      customer_email: v.email,
      client_reference_id: order.id,
      line_items: [
        ...priced.lines.map((l) => ({
          quantity: l.qty,
          price_data: { currency: 'eur', unit_amount: Math.round(l.format.price * 100), product_data: { name: `${l.product.name} — ${l.format.label[v.locale]}` } },
        })),
        ...(priced.shipping > 0
          ? [{ quantity: 1, price_data: { currency: 'eur', unit_amount: Math.round(priced.shipping * 100), product_data: { name: v.locale === 'hr' ? 'Dostava' : 'Shipping' } } }]
          : []),
      ],
      metadata: { order_id: order.id, kind: 'order' },
      payment_intent_data: { metadata: { order_id: order.id, kind: 'order' }, description: `Order ${order.id}` },
      success_url: `${ordered}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}${getPathname({ locale: v.locale, href: '/shop/cart' })}?cancelled=${order.id}&t=${order.token}`,
    });
    await setOrderSession(order.id, session.id);
    return NextResponse.json({ url: session.url, mode });
  } catch (e) {
    console.error('[shop checkout]', e);
    await cancelOrder(order.id);
    return NextResponse.json({ error: 'generic' }, { status: 502 });
  }
}
