import { describe, expect, it } from 'vitest';
import { experiences } from '@content/experiences';
import { checkBookable, dayAvailability, slotKey, type Rules } from './slots';
import { inSeason, zonedToUtc } from './time';

const rules: Rules = { timezone: 'Europe/Zagreb', leadTimeHours: 12, maxAdvanceDays: 270, blackoutDates: ['2026-10-20'], sharedCapacity: false };
const slope = experiences.find((e) => e.slug === 'the-slope')!;
const ctx = (now: string, taken: [string, number][] = [], blocked: string[] = []) => ({
  rules,
  now: new Date(now),
  taken: new Map(taken),
  blocked: new Set(blocked),
});

describe('time', () => {
  it('converts Zagreb wall time to UTC across DST', () => {
    expect(zonedToUtc('2026-07-01', '11:00', 'Europe/Zagreb').toISOString()).toBe('2026-07-01T09:00:00.000Z'); // CEST +2
    expect(zonedToUtc('2026-12-01', '11:00', 'Europe/Zagreb').toISOString()).toBe('2026-12-01T10:00:00.000Z'); // CET +1
  });
  it('handles seasons that wrap the new year', () => {
    expect(inSeason('2027-01-15', '11-01', '03-31')).toBe(true);
    expect(inSeason('2026-06-15', '11-01', '03-31')).toBe(false);
    expect(inSeason('2026-06-15', '04-01', '10-31')).toBe(true);
  });
});

describe('availability', () => {
  it('opens summer slots with full capacity', () => {
    const d = dayAvailability(slope, '2026-10-10', ctx('2026-09-25T08:00:00Z'));
    expect(d.status).toBe('open');
    expect(d.slots.map((s) => s.time)).toEqual(['11:00', '14:00', '17:30']);
    expect(d.slots[0].remaining).toBe(12);
  });

  it('enforces the 12-hour lead time', () => {
    // 2026-10-10 11:00 Zagreb = 09:00Z; now 22:00Z the day before → 11 h ahead → too late
    const d = dayAvailability(slope, '2026-10-10', ctx('2026-10-09T22:00:00Z'));
    expect(d.slots[0].status).toBe('past');
    expect(d.slots[1].status).toBe('open');
  });

  it('closes past dates, blackout dates and dates beyond the horizon', () => {
    expect(dayAvailability(slope, '2026-09-01', ctx('2026-09-25T08:00:00Z')).status).toBe('closed');
    expect(dayAvailability(slope, '2026-10-20', ctx('2026-09-25T08:00:00Z')).status).toBe('closed');
    expect(dayAvailability(slope, '2027-09-01', ctx('2026-09-25T08:00:00Z')).status).toBe('closed');
  });

  it('turns winter into request-only', () => {
    expect(dayAvailability(slope, '2026-12-10', ctx('2026-09-25T08:00:00Z')).status).toBe('request');
  });

  it('subtracts seats taken and marks full slots', () => {
    const c = ctx('2026-09-25T08:00:00Z', [
      [slotKey('the-slope', '2026-10-10', '11:00'), 12],
      [slotKey('the-slope', '2026-10-10', '14:00'), 9],
    ]);
    const d = dayAvailability(slope, '2026-10-10', c);
    expect(d.slots[0]).toMatchObject({ status: 'full', remaining: 0 });
    expect(d.slots[1]).toMatchObject({ status: 'open', remaining: 3 });
  });

  it('respects slots and dates blocked by the admin', () => {
    const c = ctx('2026-09-25T08:00:00Z', [], [slotKey('the-slope', '2026-10-10', '17:30'), '2026-10-11']);
    expect(dayAvailability(slope, '2026-10-10', c).slots[2].status).toBe('blocked');
    expect(dayAvailability(slope, '2026-10-11', c).status).toBe('closed');
  });

  it('re-checks a booking server-side', () => {
    const c = ctx('2026-09-25T08:00:00Z', [[slotKey('the-slope', '2026-10-10', '11:00'), 10]]);
    expect(checkBookable(slope, '2026-10-10', '11:00', 2, c)).toBeNull();
    expect(checkBookable(slope, '2026-10-10', '11:00', 3, c)).toBe('not_enough_seats');
    expect(checkBookable(slope, '2026-10-10', '12:00', 2, c)).toBe('slot_unavailable');
    expect(checkBookable(slope, '2026-10-10', '11:00', 0, c)).toBe('too_few_guests');
    expect(checkBookable(slope, '2026-12-10', '12:00', 2, c)).toBe('date_unavailable');
  });
});
