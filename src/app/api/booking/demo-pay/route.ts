import { NextResponse } from 'next/server';
import { finalizeBooking } from '@/lib/booking/confirm';
import { getBooking } from '@/lib/booking/store';
import { bookedUrl } from '@/lib/booking/urls';
import { stripeEnabled } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/** Demo payment — only exists while Stripe is not configured. */
export async function POST(req: Request) {
  if (stripeEnabled()) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const { b, t } = (await req.json().catch(() => ({}))) as { b?: string; t?: string };
  const booking = b && t ? await getBooking(b, t) : null;
  if (!booking || booking.payment_mode !== 'demo') return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (booking.status === 'cancelled') return NextResponse.json({ error: 'expired' }, { status: 410 });
  await finalizeBooking(booking.id);
  return NextResponse.json({ url: bookedUrl(booking.locale === 'hr' ? 'hr' : 'en', booking.id, booking.token) });
}
