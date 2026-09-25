import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getOrder } from '@/lib/shop/store';
import { stripeEnabled } from '@/lib/stripe';
import { formatEur } from '@/lib/format';
import { DemoOrderPay } from '@/components/shop/DemoOrderPay';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

export default async function DemoOrderCheckout({ params, searchParams }: PageProps<'/[locale]/shop/checkout'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  if (stripeEnabled()) notFound();
  const sp = await searchParams;
  const order = await getOrder(String(sp.o ?? ''), String(sp.t ?? ''));
  if (!order || order.payment_mode !== 'demo') notFound();
  const eur = (c: number) => formatEur(c / 100, locale);
  return (
    <section className="surface-limestone grain min-h-[100svh] pt-[calc(var(--nav-h)+3rem)] pb-24">
      <div className="container-x max-w-xl">
        <p className="label inline-block bg-sun-pale px-2 py-1 text-basalt">{locale === 'hr' ? 'Demo plaćanje · bez stvarne naplate' : 'Demo payment · no real charge'}</p>
        <h1 className="mt-6 text-display-m font-light">{order.id}</h1>
        <ul className="mt-8 border-t border-basalt/15">
          {order.lines.map((x) => (
            <li key={x.sku} className="flex justify-between gap-6 border-b border-basalt/15 py-3">
              <span>
                {x.qty} × {x.name} <span className="text-ink-soft">· {x.format}</span>
              </span>
              <span className="font-mono">{eur(x.unit_cents * x.qty)}</span>
            </li>
          ))}
          <li className="flex justify-between py-3 text-ink-soft">
            <span>{locale === 'hr' ? 'Dostava' : 'Shipping'}</span>
            <span className="font-mono">{eur(order.shipping_cents)}</span>
          </li>
        </ul>
        <p className="mt-4 flex items-baseline justify-between">
          <span className="label">{locale === 'hr' ? 'Ukupno' : 'Total'}</span>
          <span className="text-display-s font-light">{eur(order.total_cents)}</span>
        </p>
        {order.status === 'pending' && <DemoOrderPay locale={locale} id={order.id} token={order.token} total={eur(order.total_cents)} />}
      </div>
    </section>
  );
}
