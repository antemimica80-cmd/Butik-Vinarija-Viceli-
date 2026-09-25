import { NextResponse } from 'next/server';
import { getPathname } from '@/i18n/navigation';
import { finalizeOrder } from '@/lib/shop/confirm';
import { getOrder } from '@/lib/shop/store';
import { siteUrl, stripeEnabled } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (stripeEnabled()) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const { o, t } = (await req.json().catch(() => ({}))) as { o?: string; t?: string };
  const order = o && t ? await getOrder(o, t) : null;
  if (!order || order.payment_mode !== 'demo' || order.status === 'cancelled') return NextResponse.json({ error: 'not_found' }, { status: 404 });
  await finalizeOrder(order.id);
  const locale = order.locale === 'hr' ? 'hr' : 'en';
  return NextResponse.json({ url: `${siteUrl()}${getPathname({ locale, href: '/shop/ordered' })}?o=${order.id}&t=${order.token}` });
}
