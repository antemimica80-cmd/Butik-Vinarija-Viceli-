/**
 * Analytics hook. Plausible by default (cookieless, no consent needed).
 * Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN to enable; without it, events are logged in dev only.
 */
export type AnalyticsEvent =
  | { name: 'booking_started'; props: { experience: string; guests: number } }
  | { name: 'booking_paid'; props: { experience: string; guests: number; value: number } }
  | { name: 'add_to_cart'; props: { sku: string; qty: number } }
  | { name: 'purchase'; props: { value: number } };

type PlausibleFn = (event: string, options?: { props?: Record<string, string | number>; revenue?: { currency: string; amount: number } }) => void;

export function track(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;
  const plausible = (window as unknown as { plausible?: PlausibleFn }).plausible;
  const revenue = 'value' in event.props ? { currency: 'EUR', amount: event.props.value } : undefined;
  if (plausible) plausible(event.name, { props: event.props, revenue });
  else if (process.env.NODE_ENV === 'development') console.info('[analytics]', event.name, event.props);
}
