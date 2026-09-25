import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getBooking } from '@/lib/booking/store';
import { address, describe, finalizeBooking } from '@/lib/booking/confirm';
import { stripe, stripeEnabled } from '@/lib/stripe';
import { directionsUrl, fill } from '@/lib/format';
import { confirmation as C } from '@content/booking';
import { site } from '@content/site';
import { ArrowRight, WhatsAppIcon } from '@/components/ui/icons';
import { TrackPaid } from '@/components/booking/TrackPaid';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Booking', robots: { index: false } };

export default async function Booked({ params, searchParams }: PageProps<'/[locale]/experience/booked'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const sp = await searchParams;
  const id = String(sp.b ?? '');
  const token = String(sp.t ?? '');
  let booking = await getBooking(id, token);
  if (!booking) notFound();

  // The webhook may not have arrived yet: confirm directly with Stripe.
  if (booking.status === 'held' && booking.stripe_session_id && stripeEnabled()) {
    const session = await stripe().checkout.sessions.retrieve(booking.stripe_session_id);
    if (session.payment_status === 'paid') booking = (await finalizeBooking(booking.id)) ?? booking;
  }

  const l = (x: { en: string; hr: string }) => x[locale];
  const d = describe(booking);
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(fill(l(C.whatsappText), { ref: booking.id }))}`;

  if (booking.status === 'held') {
    return (
      <section className="surface-limestone grain min-h-[80svh] pt-[calc(var(--nav-h)+4rem)] pb-24">
        <meta httpEquiv="refresh" content="3" />
        <div className="container-x max-w-2xl">
          <h1 className="text-display-m font-light">{l(C.pendingTitle)}</h1>
          <p className="mt-6 text-ink-soft">{l(C.pendingBody)}</p>
        </div>
      </section>
    );
  }

  if (booking.status !== 'paid') {
    return (
      <section className="surface-limestone grain min-h-[80svh] pt-[calc(var(--nav-h)+4rem)] pb-24">
        <div className="container-x max-w-2xl">
          <h1 className="text-display-m font-light">{l(C.failedTitle)}</h1>
          <p className="mt-6 text-ink-soft">{l(C.failedBody)}</p>
          <Link href={{ pathname: '/experience', hash: 'book' }} className="btn btn-primary mt-10">
            {l(C.tryAgain)}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <TrackPaid experience={booking.experience} guests={booking.guests} value={booking.amount_cents / 100} id={booking.id} />
      <section data-nav-tone="dark" className="surface-shade grain pt-[calc(var(--nav-h)+4rem)] pb-16 md:pt-[calc(var(--nav-h)+6rem)] md:pb-24">
        <div className="container-x">
          <p className="label text-sun">{l(C.eyebrow)}</p>
          <h1 className="mt-6 max-w-4xl text-display-xl font-light">{l(C.title)}</h1>
          <p className="mt-8 text-lede text-bone/80">{fill(l(C.sentTo), { email: booking.email })}</p>
        </div>
      </section>
      <section className="surface-sun grain py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <dl className="grid gap-x-8 gap-y-6 border-t border-basalt/15 pt-8 sm:grid-cols-2 lg:col-span-7">
            {[
              [l(C.reference), booking.id, true],
              [locale === 'hr' ? 'Degustacija' : 'Tasting', d.exp?.name ?? '', false],
              [l(C.when), d.when, false],
              [l(C.guests), d.guests, false],
              [l(C.paid), d.total, false],
              [l(C.where), address, false],
            ].map(([k, v, mono]) => (
              <div key={String(k)}>
                <dt className="label text-ink-soft">{k}</dt>
                <dd className={`mt-2 text-lg ${mono ? 'font-mono' : ''}`}>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-3 lg:col-span-4 lg:col-start-9">
            <a href={`/api/booking/ics?b=${booking.id}&t=${booking.token}`} className="btn btn-primary">
              {l(C.addToCalendar)}
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <WhatsAppIcon size={16} /> {l(C.whatsapp)}
            </a>
            <a href={directionsUrl(address)} target="_blank" rel="noopener noreferrer" className="btn-link mt-3 self-start">
              {l(C.directions)} <ArrowRight size={14} />
            </a>
            <p className="mt-6 text-sm text-ink-soft">{l(C.cancellation)}</p>
          </div>
        </div>
      </section>
    </>
  );
}
