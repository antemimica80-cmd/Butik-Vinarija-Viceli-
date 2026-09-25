'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CONSENT_COOKIE, setCookie, type ConsentLevel } from '@/lib/consent';

export const CONSENT_EVENT = 'vicelic:consent';

/**
 * GDPR notice. Shown only after the age gate is passed and until a choice is made
 * (visibility handled in CSS via html[data-age-ok] / html[data-consent]).
 * Plausible is cookieless and runs regardless; "all" unlocks third-party
 * embeds (maps, video) and GA4 if it is ever enabled.
 */
export function ConsentBanner() {
  const t = useTranslations('consent');

  function choose(level: ConsentLevel) {
    setCookie(CONSENT_COOKIE, level);
    document.documentElement.setAttribute('data-consent', level);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: level }));
  }

  return (
    <div
      id="consent-banner"
      role="region"
      aria-label={t('title')}
      className="fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 md:inset-x-auto md:left-6 md:max-w-md lg:bottom-6"
    >
      <div className="surface-shade grain p-5 shadow-[0_20px_60px_rgb(0_0_0/0.35)] ring-1 ring-bone/10 md:p-6">
        <p className="label text-sun">{t('title')}</p>
        <p className="mt-3 text-sm leading-relaxed text-bone/85">
          {t('body')}{' '}
          <Link href={{ pathname: '/legal/[slug]', params: { slug: 'cookies' } }} className="underline underline-offset-4">
            {t('policy')}
          </Link>
        </p>
        <div className="mt-5 flex gap-2">
          <button type="button" className="btn btn-sun min-h-11 flex-1 px-4" onClick={() => choose('all')}>
            {t('accept')}
          </button>
          <button type="button" className="btn btn-ghost min-h-11 flex-1 px-4" onClick={() => choose('necessary')}>
            {t('necessary')}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Re-opens the banner (footer "Cookie settings" link). */
export function reopenConsent() {
  document.documentElement.removeAttribute('data-consent');
}
