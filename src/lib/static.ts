/**
 * Static preview (GitHub Pages): no server, so no payments, emails or stored
 * bookings. Set at build time by scripts/build-static.mjs.
 */
export const STATIC_PREVIEW = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

/** Path prefix when the site is served from a sub-folder (GitHub Pages project site). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const staticNotice = {
  en: 'This is a preview of the design. In the full version this step opens secure payment (Stripe) and sends the confirmation.',
  hr: 'Ovo je pregled dizajna. U punoj verziji ovaj korak otvara sigurno plaćanje (Stripe) i šalje potvrdu.',
};
