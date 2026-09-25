'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

/** Fires booking_paid once per booking (survives refreshes of the confirmation page). */
export function TrackPaid({ experience, guests, value, id }: { experience: string; guests: number; value: number; id: string }) {
  useEffect(() => {
    const key = `vicelic_paid_${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* storage unavailable — track anyway */
    }
    track({ name: 'booking_paid', props: { experience, guests, value } });
  }, [experience, guests, value, id]);
  return null;
}
