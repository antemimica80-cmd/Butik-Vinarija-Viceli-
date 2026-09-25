import { NextResponse } from 'next/server';
import { getBooking, releaseHold } from '@/lib/booking/store';
import { stripe, stripeEnabled } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/** Guest abandoned payment: release the held seats straight away. */
export async function POST(req: Request) {
  const { b, t } = (await req.json().catch(() => ({}))) as { b?: string; t?: string };
  const booking = b && t ? await getBooking(b, t) : null;
  if (!booking) return NextResponse.json({ ok: true });
  if (booking.status === 'held') {
    if (booking.stripe_session_id && stripeEnabled()) {
      await stripe().checkout.sessions.expire(booking.stripe_session_id).catch(() => null);
    }
    await releaseHold(booking.id, 'cancelled');
  }
  return NextResponse.json({ ok: true });
}
