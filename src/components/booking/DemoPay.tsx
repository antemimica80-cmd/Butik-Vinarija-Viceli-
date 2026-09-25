'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';

export function DemoPay({ locale, id, token, expiresAt, status, total }: { locale: 'en' | 'hr'; id: string; token: string; expiresAt: string | null; status: string; total: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setLeft(Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  async function pay() {
    setBusy(true);
    const res = await fetch('/api/booking/demo-pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ b: id, t: token }) });
    const json = (await res.json()) as { url?: string };
    if (json.url) location.assign(json.url);
    else setBusy(false);
  }

  async function cancel() {
    setBusy(true);
    await fetch('/api/booking/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ b: id, t: token }) });
    router.push('/experience');
  }

  if (status !== 'held') return null;
  const mm = left !== null ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : '';

  return (
    <div className="mt-10">
      <button type="button" onClick={pay} disabled={busy || left === 0} className="btn btn-primary w-full disabled:opacity-40">
        {locale === 'hr' ? `Plati ${total} (demo)` : `Pay ${total} (demo)`}
      </button>
      <button type="button" onClick={cancel} disabled={busy} className="btn-link mx-auto mt-6 flex">
        {locale === 'hr' ? 'Odustani' : 'Cancel'}
      </button>
      {left !== null && (
        <p className="mt-6 text-center font-mono text-xs text-ink-soft" aria-live="off">
          {locale === 'hr' ? `Mjesta su zadržana još ${mm}` : `Seats held for ${mm}`}
        </p>
      )}
    </div>
  );
}
