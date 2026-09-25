import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createHold, findExperience, releaseHold, setStripeSession } from '@/lib/booking/store';
import { bookedUrl, checkoutUrl, experienceUrl } from '@/lib/booking/urls';
import { formatDate } from '@/lib/booking/time';
import { stripe, stripeEnabled } from '@/lib/stripe';
import { availability } from '@content/availability';

export const dynamic = 'force-dynamic';

const body = z.object({
  experience: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  adults: z.number().int().min(1).max(50),
  children: z.number().int().min(0).max(50),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).default(''),
  notes: z.string().trim().max(1000).default(''),
  locale: z.enum(['en', 'hr']),
  terms: z.literal(true),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid', fields: parsed.error.issues.map((i) => i.path.join('.')) }, { status: 400 });
  }
  const input = parsed.data;
  const exp = findExperience(input.experience);
  if (!exp) return NextResponse.json({ error: 'invalid', fields: ['experience'] }, { status: 400 });

  const mode = stripeEnabled() ? 'stripe' : 'demo';
  const hold = await createHold({ ...input, experience: exp, paymentMode: mode });
  if (!hold.ok) return NextResponse.json({ error: hold.reason }, { status: 409 });
  const b = hold.booking;

  if (mode === 'demo') return NextResponse.json({ url: checkoutUrl(input.locale, b.id, b.token), mode });

  try {
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      locale: input.locale,
      customer_email: b.email,
      client_reference_id: b.id,
      line_items: [
        {
          quantity: b.adults,
          price_data: {
            currency: 'eur',
            unit_amount: b.amount_cents / b.adults,
            product_data: {
              name: `${exp.name} — Vicelić`,
              description: `${formatDate(b.date, input.locale)}, ${b.time} · ${b.guests} ${input.locale === 'hr' ? 'gostiju' : 'guests'} · ${b.id}`,
            },
          },
        },
      ],
      metadata: { booking_id: b.id, kind: 'tasting' },
      payment_intent_data: { metadata: { booking_id: b.id, kind: 'tasting' }, description: `Tasting ${b.id}` },
      expires_at: Math.floor(Date.now() / 1000) + Math.max(30, availability.holdMinutes - 2) * 60,
      success_url: bookedUrl(input.locale, b.id, b.token, '&session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: `${experienceUrl(input.locale)}?cancelled=${b.id}&t=${b.token}#book`,
    });
    await setStripeSession(b.id, session.id);
    return NextResponse.json({ url: session.url, mode });
  } catch (e) {
    console.error('[checkout]', e);
    await releaseHold(b.id, 'cancelled');
    return NextResponse.json({ error: 'generic' }, { status: 502 });
  }
}
