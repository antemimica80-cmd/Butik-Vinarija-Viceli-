'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { AGE_COOKIE, setCookie } from '@/lib/consent';
import { Wordmark } from './Wordmark';
import { LocaleSwitch } from './LocaleSwitch';

/**
 * 18+ gate on first visit. Always server-rendered; hidden by CSS
 * (html[data-age-ok]) for visitors who have already confirmed, so there is no flash.
 */
export function AgeGate() {
  const t = useTranslations('ageGate');
  const [denied, setDenied] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!document.documentElement.hasAttribute('data-age-ok')) confirmRef.current?.focus();
  }, []);

  function confirm() {
    setCookie(AGE_COOKIE, '1');
    document.documentElement.setAttribute('data-age-ok', '');
  }

  return (
    <div
      id="age-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-question"
      className="surface-shade grain fixed inset-0 z-[60] flex flex-col overflow-y-auto"
    >
      <div className="container-x flex h-[var(--nav-h)] shrink-0 items-center justify-between">
        <Wordmark />
        <LocaleSwitch />
      </div>
      <div className="container-x flex flex-1 flex-col justify-center py-12">
        <div className="gate-in max-w-2xl">
          <p className="label text-sun">{t('eyebrow')}</p>
          {!denied ? (
            <>
              <h2 id="age-gate-title" className="mt-6 text-display-l font-light">
                {t('title')}
              </h2>
              <p id="age-gate-question" className="mt-6 max-w-lg text-lede text-bone/85">
                {t('question')}
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <button ref={confirmRef} type="button" className="btn btn-sun" onClick={confirm}>
                  {t('confirm')}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setDenied(true)}>
                  {t('deny')}
                </button>
              </div>
              <p className="mt-8 text-sm text-stone-light">{t('note')}</p>
            </>
          ) : (
            <div aria-live="polite">
              <h2 id="age-gate-title" className="mt-6 text-display-l font-light">
                {t('deniedTitle')}
              </h2>
              <p id="age-gate-question" className="mt-6 max-w-lg text-lede text-bone/85">
                {t('deniedBody')}
              </p>
              <button type="button" className="btn-link mt-10" onClick={() => setDenied(false)}>
                {t('back')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
