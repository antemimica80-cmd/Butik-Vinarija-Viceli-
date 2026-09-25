'use client';

import { useState, type FormEvent } from 'react';
import { experiencePage } from '@content/booking';
import { STATIC_PREVIEW, staticNotice } from '@/lib/static';

export function TradeForm({ locale }: { locale: 'en' | 'hr' }) {
  const t = experiencePage.trade;
  const l = (x: { en: string; hr: string }) => x[locale];
  const [state, setState] = useState<'idle' | 'loading' | 'sent' | 'error' | 'preview'>('idle');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (STATIC_PREVIEW) return setState('preview');
    setState('loading');
    const res = await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'trade', locale, ...Object.fromEntries(f.entries()) }),
    }).catch(() => null);
    setState(res?.ok ? 'sent' : 'error');
  }

  if (state === 'sent')
    return (
      <p className="text-lede text-bone" role="status">
        {l(t.sent)}
      </p>
    );

  const input = 'mt-1.5 w-full border border-bone/25 bg-transparent px-3 py-3 outline-none focus:border-bone';
  const field = (name: keyof typeof t.fields, type = 'text', required = false, auto?: string) => (
    <div>
      <label htmlFor={`t-${name}`} className="text-sm text-bone/80">
        {l(t.fields[name])}
        {required && <span aria-hidden> *</span>}
      </label>
      <input id={`t-${name}`} name={name} type={type} required={required} autoComplete={auto} className={input} />
    </div>
  );

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      {field('company', 'text', true, 'organization')}
      <div>
        <label htmlFor="t-role" className="text-sm text-bone/80">
          {l(t.fields.role)}
        </label>
        <select id="t-role" name="role" className={`${input} bg-basalt`}>
          {t.roles.map((r) => (
            <option key={r.en} value={r.en}>
              {l(r)}
            </option>
          ))}
        </select>
      </div>
      {field('name', 'text', true, 'name')}
      {field('email', 'email', true, 'email')}
      {field('phone', 'tel', false, 'tel')}
      {field('volume')}
      <div className="sm:col-span-2">
        <label htmlFor="t-message" className="text-sm text-bone/80">
          {l(t.fields.message)}
        </label>
        <textarea id="t-message" name="message" rows={3} className={input} />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-sun" disabled={state === 'loading'}>
          {l(t.submit)}
        </button>
        {state === 'preview' && (
          <p className="mt-3 text-sm text-sun-pale" role="status">
            {staticNotice[locale]}
          </p>
        )}
        {state === 'error' && (
          <p className="mt-3 text-sm text-sun-pale" role="alert">
            {locale === 'hr' ? 'Provjerite polja i pokušajte ponovno.' : 'Please check the fields and try again.'}
          </p>
        )}
      </div>
    </form>
  );
}
