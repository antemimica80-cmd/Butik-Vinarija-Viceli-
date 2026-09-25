import 'server-only';
import Stripe from 'stripe';

/**
 * Stripe is used only when a real key is configured (test mode: sk_test_…).
 * Without one the site runs in demo-payment mode so the full flow can be shown.
 */
export function stripeEnabled() {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(key && key.startsWith('sk_') && !key.includes('...'));
}

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!stripeEnabled()) throw new Error('Stripe is not configured');
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY!);
  return client;
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}
