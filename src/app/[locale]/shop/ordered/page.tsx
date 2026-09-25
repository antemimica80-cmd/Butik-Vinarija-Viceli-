import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { shopCopy as S } from '@content/products';
import { site } from '@content/site';
import { getOrder } from '@/lib/shop/store';
import { addressLines, finalizeOrder } from '@/lib/shop/confirm';
import { stripe, stripeEnabled } from '@/lib/stripe';
import { fill, formatEur } from '@/lib/format';
import { OrderDone } from '@/components/shop/OrderDone';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Order', robots: { index: false } };

export default async function Ordered({ params, searchParams }: PageProps<'/[locale]/shop/ordered'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const sp = await searchParams;
  let order = await getOrder(String(sp.o ?? ''), String(sp.t ?? ''));
  if (!order) notFound();
  if (order.status === 'pending' && order.stripe_session_id && stripeEnabled()) {
    const session = await stripe().checkout.sessions.retrieve(order.stripe_session_id);
    if (session.payment_status === 'paid') order = (await finalizeOrder(order.id)) ?? order;
  }
  const l = (x: { en: string; hr: string }) => x[locale];
  const O = S.ordered;
  const eur = (c: number) => formatEur(c / 100, locale);

  if (order.status !== 'paid') {
    return (
      <section className="surface-limestone grain min-h-[80svh] pt-[calc(var(--nav-h)+4rem)] pb-24">
        {order.status === 'pending' && <meta httpEquiv="refresh" content="3" />}
        <div className="container-x max-w-2xl">
          <h1 className="text-display-m font-light">{order.status === 'pending' ? l(O.pendingTitle) : l(O.failedTitle)}</h1>
          {order.status !== 'pending' && <p className="mt-6 text-ink-soft">{l(O.failedBody)}</p>}
          <Link href="/shop/cart" className="btn btn-primary mt-10">
            {l(S.cart.title)}
          </Link>
        </div>
      </section>
    );
  }

  const pickup = 'pickup' in order.address;
  return (
    <>
      <OrderDone value={order.total_cents / 100} id={order.id} />
      <section data-nav-tone="dark" className="surface-shade grain pt-[calc(var(--nav-h)+4rem)] pb-16 md:pt-[calc(var(--nav-h)+6rem)] md:pb-24">
        <div className="container-x">
          <p className="label text-sun">
            {l(O.eyebrow)} · <span className="font-mono">{order.id}</span>
          </p>
          <h1 className="mt-6 max-w-4xl text-display-xl font-light">{pickup ? l(O.pickupTitle) : l(O.title)}</h1>
          <p className="mt-8 text-lede text-bone/80">{fill(l(O.sentTo), { email: order.email })}</p>
        </div>
      </section>
      <section className="surface-sun grain py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <ul className="border-t border-basalt/15 lg:col-span-7">
            {order.lines.map((x) => (
              <li key={x.sku} className="flex justify-between gap-6 border-b border-basalt/15 py-4">
                <span>
                  {x.qty} × {x.name} <span className="text-ink-soft">· {x.format}</span>
                </span>
                <span className="font-mono">{eur(x.unit_cents * x.qty)}</span>
              </li>
            ))}
            <li className="flex justify-between py-4 text-ink-soft">
              <span>{l(S.cart.shipping)}</span>
              <span className="font-mono">{order.shipping_cents ? eur(order.shipping_cents) : l(S.cart.free)}</span>
            </li>
            <li className="flex items-baseline justify-between border-t border-basalt py-4">
              <span className="label">{l(S.cart.total)}</span>
              <span className="text-display-s font-light">{eur(order.total_cents)}</span>
            </li>
          </ul>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="label text-ink-soft">{pickup ? l(O.pickup) : l(O.deliverTo)}</p>
            <address className="mt-3 not-italic leading-relaxed">
              {(pickup ? [site.nameEn, site.address.street, `${site.address.postalCode} ${site.address.city}`] : addressLines(order)).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>
        </div>
      </section>
    </>
  );
}
