/**
 * Availability — pure functions, no I/O. Given the rules (content files), the
 * seats already taken and the admin-blocked slots, what can a guest book?
 */
import type { Experience } from '@/lib/content-schema';
import { addDays, dayOfWeek, daysInMonth, inSeason, todayIn, zonedToUtc } from './time';

export type Rules = {
  timezone: string;
  leadTimeHours: number;
  maxAdvanceDays: number;
  blackoutDates: string[];
  sharedCapacity: boolean;
};

export type SlotStatus = 'open' | 'full' | 'past' | 'blocked';
export type Slot = { time: string; status: SlotStatus; remaining: number };
export type DayStatus = 'open' | 'full' | 'closed' | 'request';
export type Day = { date: string; status: DayStatus; slots: Slot[] };

/** Seat counts are keyed by slot. With shared capacity the experience part is '*'. */
export function slotKey(experience: string, date: string, time: string, shared = false) {
  return `${shared ? '*' : experience}|${date}|${time}`;
}

type Ctx = {
  rules: Rules;
  now: Date;
  /** seats taken (paid + live holds) per slot key */
  taken: Map<string, number>;
  /** slot keys (experience-specific) or 'date' strings blocked by the admin */
  blocked: Set<string>;
};

export function dayAvailability(exp: Experience, date: string, ctx: Ctx): Day {
  const { rules, now } = ctx;
  const today = todayIn(rules.timezone, now);
  const last = addDays(today, rules.maxAdvanceDays);
  const season = exp.seasons.find((s) => inSeason(date, s.from, s.to));

  if (date < today || date > last || !season || !season.days.includes(dayOfWeek(date)) || rules.blackoutDates.includes(date) || ctx.blocked.has(date)) {
    return { date, status: 'closed', slots: [] };
  }
  if (season.onRequestOnly) return { date, status: 'request', slots: [] };

  const earliest = now.getTime() + rules.leadTimeHours * 3600_000;
  const capacity = exp.capacityPerSlot;
  const slots: Slot[] = season.slots.map((time) => {
    const start = zonedToUtc(date, time, rules.timezone).getTime();
    if (start < earliest) return { time, status: 'past', remaining: 0 };
    if (ctx.blocked.has(slotKey(exp.slug, date, time))) return { time, status: 'blocked', remaining: 0 };
    const taken = ctx.taken.get(slotKey(exp.slug, date, time, rules.sharedCapacity)) ?? 0;
    const remaining = Math.max(0, Math.min(capacity - taken, exp.maxGuests));
    return { time, status: remaining >= exp.minGuests ? 'open' : 'full', remaining };
  });

  const bookable = slots.filter((s) => s.status !== 'past');
  if (bookable.length === 0) return { date, status: 'closed', slots };
  return { date, status: bookable.some((s) => s.status === 'open') ? 'open' : 'full', slots };
}

export function monthAvailability(exp: Experience, month: string, ctx: Ctx): Day[] {
  return daysInMonth(month).map((date) => dayAvailability(exp, date, ctx));
}

/** Server-side re-check before holding seats. Returns null if bookable, else a reason. */
export function checkBookable(exp: Experience, date: string, time: string, guests: number, ctx: Ctx): string | null {
  if (guests < exp.minGuests) return 'too_few_guests';
  if (guests > exp.maxGuests) return 'too_many_guests';
  const day = dayAvailability(exp, date, ctx);
  if (day.status === 'closed' || day.status === 'request') return 'date_unavailable';
  const slot = day.slots.find((s) => s.time === time);
  if (!slot || slot.status === 'past' || slot.status === 'blocked') return 'slot_unavailable';
  if (slot.remaining < guests) return 'not_enough_seats';
  return null;
}
