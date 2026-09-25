'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';

export function DemoOrderPay({ locale, id, token, total }: { locale: 'en' | 'hr'; id: string; token: string; total: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const post = (url: string) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ o: id, t: token }) });
  return (
    <div className="mt-10">
      <button
        type="button"
        disabled={busy}
        className="btn btn-primary w-full"
        onClick={async () => {
          setBusy(true);
          const j = (await (await post('/api/shop/demo-pay')).json()) as { url?: string };
          if (j.url) location.assign(j.url);
          else setBusy(false);
        }}
      >
        {locale === 'hr' ? `Plati ${total} (demo)` : `Pay ${total} (demo)`}
      </button>
      <button
        type="button"
        disabled={busy}
        className="btn-link mx-auto mt-6 flex"
        onClick={async () => {
          setBusy(true);
          await post('/api/shop/cancel');
          router.push('/shop/cart');
        }}
      >
        {locale === 'hr' ? 'Odustani' : 'Cancel'}
      </button>
    </div>
  );
}
