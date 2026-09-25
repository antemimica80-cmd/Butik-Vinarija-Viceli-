import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { finalizeBooking } from '@/lib/booking/confirm';
import { releaseHold } from '@/lib/booking/store';
import { finalizeOrder } from '@/lib/shop/confirm';
import { cancelOrder } from '@/lib/shop/store';
import { stripe, stripeEnabled } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * Stripe → us. Configure in the Stripe dashboard (or `stripe listen --forward-to
 * localhost:3000/api/stripe/webhook`) for: checkout.session.completed,
 * checkout.session.async_payment_succeeded, checkout.session.expired.
 */
export async function POST(req: Request) {
  if (!stripeEnabled()) return NextResponse.json({ error: 'stripe_disabled' }, { status: 404 });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get('stripe-signature');
  if (!secret || !signature) return NextResponse.json({ error: 'no_signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch (e) {
    console.error('[webhook] bad signature', e);
    return NextResponse.json({ error: 'bad_signature' }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.metadata?.kind === 'order' && session.metadata.order_id) {
    const orderId = session.metadata.order_id;
    if ((event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') && session.payment_status === 'paid') await finalizeOrder(orderId);
    if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') await cancelOrder(orderId);
    return NextResponse.json({ received: true });
  }

  const id = session.metadata?.booking_id;
  if (!id || session.metadata?.kind !== 'tasting') return NextResponse.json({ received: true });

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      if (session.payment_status === 'paid') await finalizeBooking(id);
      break;
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed':
      await releaseHold(id, 'expired');
      break;
  }
  return NextResponse.json({ received: true });
}
