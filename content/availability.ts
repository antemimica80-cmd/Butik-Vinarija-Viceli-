/**
 * Booking rules shared by every experience. Per-experience seasons, days, slots
 * and capacity live in experiences.ts. PROPOSAL VALUES — confirm with the owner.
 */
export const availability = {
  timezone: 'Europe/Zagreb',
  /** No bookings closer than this to the start of a slot. */
  leadTimeHours: 12,
  /** How far ahead guests can book. */
  maxAdvanceDays: 270,
  /** How long seats are held while the guest pays. Stripe Checkout needs ≥ 30 min. */
  holdMinutes: 35,
  /** Whole days with no tastings (YYYY-MM-DD). Harvest days, holidays, family days. */
  blackoutDates: [
    // TODO: owner to add, e.g. '2026-12-25'
  ] as string[],
  /**
   * Whether all experiences share one pool of seats per time slot.
   * false = each experience has its own capacity (e.g. The Terroir on the terrace and
   * Dingač Private in the vineyard can run at the same time).
   */
  sharedCapacity: false,
};
