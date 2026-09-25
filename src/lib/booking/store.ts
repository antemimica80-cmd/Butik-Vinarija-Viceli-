import 'server-only';
import { randomBytes } from 'node:crypto';
import { db, type Query } from '@/lib/db';
import { availability } from '@content/availability';
import { experiences } from '@content/experiences';
import type { Experience } from '@/lib/content-schema';
import { checkBookable, monthAvailability, slotKey, type Rules } from './slots';

export const rules: Rules = availability;

export type Booking = {
  id: string;
  token: string;
  experience: string;
  date: string;
  time: string;
  slot_key: string;
  adults: number;
  children: number;
  guests: number;
  amount_cents: number;
  currency: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  locale: string;
  status: 'held' | 'paid' | 'cancelled' | 'expired';
  hold_expires_at: string | null;
  stripe_session_id: string | null;
  payment_mode: 'demo' | 'stripe';
  created_at: string;
  paid_at: string | null;
  emails_sent_at: string | null;
};

export function findExperience(slug: string): Experience | undefined {
  return experiences.find((e) => e.slug === slug);
}

/** Seats that count against capacity: paid bookings and holds that have not expired. */
const LIVE = `(status = 'paid' OR (status = 'held' AND hold_expires_at > now()))`;

async function takenFor(q: Query, keys: string[]) {
  const taken = new Map<string, number>();
  if (keys.length === 0) return taken;
  const rows = await q<{ slot_key: string; n: number }>(
    `SELECT slot_key, SUM(guests)::int AS n FROM bookings WHERE slot_key = ANY($1) AND ${LIVE} GROUP BY slot_key`,
    [keys],
  );
  for (const r of rows) taken.set(r.slot_key, Number(r.n));
  return taken;
}

/** Blocked keys are either a whole date ('2026-10-11') or one slot ('the-slope|2026-10-11|11:00'). */
async function blockedSet(q: Query, datePrefix: string) {
  const rows = await q<{ key: string }>(`SELECT key FROM blocked WHERE key LIKE $1`, [`%${datePrefix}%`]);
  return new Set(rows.map((r) => r.key));
}

export async function getMonth(exp: Experience, month: string, now = new Date()) {
  const { query } = await db();
  const rows = await query<{ slot_key: string; n: number }>(
    `SELECT slot_key, SUM(guests)::int AS n FROM bookings WHERE date LIKE $1 AND ${LIVE} GROUP BY slot_key`,
    [`${month}-%`],
  );
  const taken = new Map(rows.map((r) => [r.slot_key, Number(r.n)]));
  const blocked = await blockedSet(query, month);
  return monthAvailability(exp, month, { rules, now, taken, blocked });
}

function newId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(6);
  return 'VCL-' + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export type HoldInput = {
  experience: Experience;
  date: string;
  time: string;
  adults: number;
  children: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  locale: string;
  paymentMode: 'demo' | 'stripe';
};

/**
 * Hold seats for the guest while they pay. The per-slot advisory lock makes
 * "check remaining seats, then insert" atomic, so two guests can never take the last seats.
 */
export async function createHold(input: HoldInput): Promise<{ ok: true; booking: Booking } | { ok: false; reason: string }> {
  const { experience: exp, date, time, adults, children } = input;
  const guests = adults + children;
  const price = exp.pricePerPerson;
  if (price === 'TBD') return { ok: false, reason: 'price_tbd' };
  const key = slotKey(exp.slug, date, time, rules.sharedCapacity);
  const { tx } = await db();

  return tx(async (q) => {
    await q(`SELECT pg_advisory_xact_lock(hashtext($1))`, [key]);
    const taken = await takenFor(q, [key]);
    const blocked = await blockedSet(q, date);
    const reason = checkBookable(exp, date, time, guests, { rules, now: new Date(), taken, blocked });
    if (reason) return { ok: false as const, reason };

    const rows = await q<Booking>(
      `INSERT INTO bookings (id, token, experience, date, time, slot_key, adults, children, guests, amount_cents, name, email, phone, notes, locale, status, hold_expires_at, payment_mode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'held', now() + ($16 || ' minutes')::interval, $17)
       RETURNING *`,
      [
        newId(),
        randomBytes(18).toString('base64url'),
        exp.slug,
        date,
        time,
        key,
        adults,
        children,
        guests,
        adults * price * 100,
        input.name,
        input.email,
        input.phone,
        input.notes,
        input.locale,
        String(availability.holdMinutes),
        input.paymentMode,
      ],
    );
    return { ok: true as const, booking: rows[0] };
  });
}

export async function getBooking(id: string, token?: string): Promise<Booking | null> {
  const { query } = await db();
  const rows = await query<Booking>(`SELECT * FROM bookings WHERE id = $1`, [id]);
  const b = rows[0];
  if (!b || (token !== undefined && b.token !== token)) return null;
  return b;
}

export async function setStripeSession(id: string, sessionId: string) {
  const { query } = await db();
  await query(`UPDATE bookings SET stripe_session_id = $2 WHERE id = $1`, [id, sessionId]);
}

/**
 * Mark a booking paid. Idempotent. A paid hold that had already expired is still
 * honoured (the guest paid) — the winery is told if that overbooks the slot.
 * Returns the booking and whether this call is the one that confirmed it.
 */
export async function markPaid(id: string): Promise<{ booking: Booking; firstTime: boolean } | null> {
  const { query } = await db();
  const rows = await query<Booking>(
    `UPDATE bookings SET status = 'paid', paid_at = now(), hold_expires_at = NULL WHERE id = $1 AND status IN ('held','expired') RETURNING *`,
    [id],
  );
  if (rows[0]) return { booking: rows[0], firstTime: true };
  const existing = await getBooking(id);
  return existing ? { booking: existing, firstTime: false } : null;
}

/** Claim the right to send confirmation emails exactly once. */
export async function claimEmails(id: string): Promise<boolean> {
  const { query } = await db();
  const rows = await query(`UPDATE bookings SET emails_sent_at = now() WHERE id = $1 AND emails_sent_at IS NULL RETURNING id`, [id]);
  return rows.length > 0;
}

export async function releaseHold(id: string, status: 'expired' | 'cancelled' = 'expired') {
  const { query } = await db();
  await query(`UPDATE bookings SET status = $2 WHERE id = $1 AND status = 'held'`, [id, status]);
}

export async function slotOverbooked(b: Booking) {
  const exp = findExperience(b.experience);
  if (!exp) return false;
  const { query } = await db();
  const taken = await takenFor(query, [b.slot_key]);
  return (taken.get(b.slot_key) ?? 0) > exp.capacityPerSlot;
}

// ── Admin ────────────────────────────────────────────────────────────────

export async function listBookings(from: string) {
  const { query } = await db();
  return query<Booking>(`SELECT * FROM bookings WHERE date >= $1 AND ${LIVE} ORDER BY date, time, created_at`, [from]);
}

export async function listBlocked() {
  const { query } = await db();
  return query<{ key: string; reason: string }>(`SELECT key, reason FROM blocked ORDER BY key`);
}

export async function setBlocked(key: string, blocked: boolean, reason = '') {
  const { query } = await db();
  if (blocked) await query(`INSERT INTO blocked (key, reason) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET reason = $2`, [key, reason]);
  else await query(`DELETE FROM blocked WHERE key = $1`, [key]);
}

export async function saveEnquiry(kind: 'trade' | 'winter', payload: Record<string, unknown>) {
  const { query } = await db();
  const id = `${kind}-${Date.now()}-${randomBytes(3).toString('hex')}`;
  await query(`INSERT INTO enquiries (id, kind, payload) VALUES ($1, $2, $3)`, [id, kind, JSON.stringify(payload)]);
  return id;
}
