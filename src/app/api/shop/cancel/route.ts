import { NextResponse } from 'next/server';
import { cancelOrder, getOrder } from '@/lib/shop/store';
import { stripe, stripeEnabled } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { o, t } = (await req.json().catch(() => ({}))) as { o?: string; t?: string };
  const order = o && t ? await getOrder(o, t) : null;
  if (order?.status === 'pending') {
    if (order.stripe_session_id && stripeEnabled()) await stripe().checkout.sessions.expire(order.stripe_session_id).catch(() => null);
    await cancelOrder(order.id);
  }
  return NextResponse.json({ ok: true });
}
