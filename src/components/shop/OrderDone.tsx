'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import { clearCart } from '@/lib/cart';

/** On a paid order: empty the cart and record the purchase once. */
export function OrderDone({ value, id }: { value: number; id: string }) {
  useEffect(() => {
    clearCart();
    const key = `vicelic_order_${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* track anyway */
    }
    track({ name: 'purchase', props: { value } });
  }, [value, id]);
  return null;
}
