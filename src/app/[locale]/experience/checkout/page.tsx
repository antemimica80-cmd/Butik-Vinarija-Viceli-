import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getBooking } from '@/lib/booking/store';
import { describe } from '@/lib/booking/confirm';
import { stripeEnabled } from '@/lib/stripe';
import { confirmation as C } from '@content/booking';
import { DemoPay } from '@/components/booking/DemoPay';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

/** Stand-in for Stripe Checkout while no Stripe keys are configured. */
export default async function DemoCheckout({ params, searchParams }: PageProps<'/[locale]/experience/checkout'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const sp = await searchParams;
  if (stripeEnabled()) notFound();
  const booking = await getBooking(String(sp.b ?? ''), String(sp.t ?? ''));
  if (!booking || booking.payment_mode !== 'demo') notFound();
  const d = describe(booking);
  const l = (x: { en: string; hr: string }) => x[locale];

  return (
    <section className="surface-limestone grain min-h-[100svh] pt-[calc(var(--nav-h)+3rem)] pb-24">
      <div className="container-x max-w-xl">
        <p className="label inline-block bg-sun-pale px-2 py-1 text-basalt">{locale === 'hr' ? 'Demo plaćanje · bez stvarne naplate' : 'Demo payment · no real charge'}</p>
        <h1 className="mt-6 text-display-m font-light">{d.exp?.name}</h1>
        <dl className="mt-8 space-y-3 border-t border-basalt/15 pt-6">
          <div className="flex justify-between gap-6">
            <dt className="text-ink-soft">{l(C.when)}</dt>
            <dd className="text-right">{d.when}</dd>
          </div>
          <div className="flex justify-between gap-6">
            <dt className="text-ink-soft">{l(C.guests)}</dt>
            <dd>{d.guests}</dd>
          </div>
          <div className="flex justify-between gap-6 border-t border-basalt/15 pt-4">
            <dt className="text-ink-soft">{locale === 'hr' ? 'Za platiti' : 'To pay'}</dt>
            <dd className="text-display-s font-light">{d.total}</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-ink-soft">
          {locale === 'hr'
            ? 'Kad se dodaju Stripe ključevi, ovdje se otvara Stripe Checkout (kartica, Apple Pay, Google Pay). Mjesta su zadržana dok gost plaća.'
            : 'Once Stripe keys are added, Stripe Checkout opens here instead (card, Apple Pay, Google Pay). Seats are held while the guest pays.'}
        </p>
        <DemoPay locale={locale} id={booking.id} token={booking.token} expiresAt={booking.hold_expires_at} status={booking.status} total={d.total} />
      </div>
    </section>
  );
}
