import 'server-only';
import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { initialStock } from '@content/products';
import type { Priced } from './catalog';

export type Address = { street: string; postal: string; city: string; country: string } | { pickup: true };

export type Order = {
  id: string;
  token: string;
  lines: { sku: string; qty: number; name: string; format: string; unit_cents: number }[];
  bottles: Record<string, number>;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  vat_cents: number;
  zone: string;
  country: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  notes: string;
  locale: string;
  status: 'pending' | 'paid' | 'cancelled';
  stock_ok: boolean | null;
  stripe_session_id: string | null;
  payment_mode: 'demo' | 'stripe';
  created_at: string;
  paid_at: string | null;
  emails_sent_at: string | null;
};

const g = globalThis as unknown as { __vicelicStockSeeded?: Promise<void> };

/** Seed stock rows from content/products.ts the first time (existing counts are never overwritten). */
async function ensureStock() {
  g.__vicelicStockSeeded ??= (async () => {
    const { query } = await db();
    for (const [wine, n] of Object.entries(initialStock)) {
      await query(`INSERT INTO stock (wine, bottles) VALUES ($1, $2) ON CONFLICT (wine) DO NOTHING`, [wine, n]);
    }
  })();
  return g.__vicelicStockSeeded;
}

export async function getStock(): Promise<Record<string, number>> {
  await ensureStock();
  const { query } = await db();
  const rows = await query<{ wine: string; bottles: number }>(`SELECT wine, bottles FROM stock`);
  return Object.fromEntries(rows.map((r) => [r.wine, Number(r.bottles)]));
}

export function shortOf(bottles: Record<string, number>, stock: Record<string, number>) {
  return Object.entries(bottles).filter(([wine, n]) => (stock[wine] ?? 0) < n).map(([wine]) => wine);
}

function newId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'VCO-' + Array.from(randomBytes(6), (b) => alphabet[b % alphabet.length]).join('');
}

export async function createOrder(input: {
  priced: Priced;
  country: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  notes: string;
  locale: string;
  paymentMode: 'demo' | 'stripe';
}): Promise<Order> {
  const { priced } = input;
  const { query } = await db();
  const cents = (x: number) => Math.round(x * 100);
  const rows = await query<Order>(
    `INSERT INTO orders (id, token, lines, bottles, subtotal_cents, shipping_cents, total_cents, vat_cents, zone, country, name, email, phone, address, notes, locale, status, payment_mode)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'pending',$17) RETURNING *`,
    [
      newId(),
      randomBytes(18).toString('base64url'),
      JSON.stringify(
        priced.lines.map((l) => ({ sku: l.sku, qty: l.qty, name: l.product.name, format: l.format.label.en, unit_cents: cents(l.format.price) })),
      ),
      JSON.stringify(priced.bottlesByWine),
      cents(priced.subtotal),
      cents(priced.shipping),
      cents(priced.total),
      cents(priced.vat),
      priced.zone!.id,
      input.country,
      input.name,
      input.email,
      input.phone,
      JSON.stringify(input.address),
      input.notes,
      input.locale,
      input.paymentMode,
    ],
  );
  return rows[0];
}

export async function getOrder(id: string, token?: string): Promise<Order | null> {
  const { query } = await db();
  const o = (await query<Order>(`SELECT * FROM orders WHERE id = $1`, [id]))[0];
  if (!o || (token !== undefined && o.token !== token)) return null;
  return o;
}

export async function setOrderSession(id: string, sessionId: string) {
  const { query } = await db();
  await query(`UPDATE orders SET stripe_session_id = $2 WHERE id = $1`, [id, sessionId]);
}

export async function cancelOrder(id: string) {
  const { query } = await db();
  await query(`UPDATE orders SET status = 'cancelled' WHERE id = $1 AND status = 'pending'`, [id]);
}

/**
 * Mark paid and take the bottles out of stock, atomically and once. If stock ran out
 * between checkout and payment, the order is still paid (the customer paid) but
 * stock_ok = false so the winery is warned.
 */
export async function markOrderPaid(id: string): Promise<{ order: Order; firstTime: boolean } | null> {
  await ensureStock();
  const { tx } = await db();
  return tx(async (q) => {
    const rows = await q<Order>(`UPDATE orders SET status = 'paid', paid_at = now() WHERE id = $1 AND status IN ('pending','cancelled') RETURNING *`, [id]);
    const order = rows[0];
    if (!order) {
      const existing = (await q<Order>(`SELECT * FROM orders WHERE id = $1`, [id]))[0];
      return existing ? { order: existing, firstTime: false } : null;
    }
    let ok = true;
    for (const [wine, n] of Object.entries(order.bottles)) {
      const updated = await q(`UPDATE stock SET bottles = bottles - $2 WHERE wine = $1 AND bottles >= $2 RETURNING wine`, [wine, n]);
      if (updated.length === 0) {
        ok = false;
        await q(`UPDATE stock SET bottles = 0 WHERE wine = $1`, [wine]);
      }
    }
    const final = (await q<Order>(`UPDATE orders SET stock_ok = $2 WHERE id = $1 RETURNING *`, [id, ok]))[0];
    return { order: final, firstTime: true };
  });
}

export async function claimOrderEmails(id: string) {
  const { query } = await db();
  return (await query(`UPDATE orders SET emails_sent_at = now() WHERE id = $1 AND emails_sent_at IS NULL RETURNING id`, [id])).length > 0;
}

export async function listOrders(limit = 100) {
  const { query } = await db();
  return query<Order>(`SELECT * FROM orders WHERE status = 'paid' ORDER BY paid_at DESC LIMIT $1`, [limit]);
}
