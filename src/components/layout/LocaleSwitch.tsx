'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';

/** EN / HR switch. Keeps the visitor on the equivalent page in the other language. */
export function LocaleSwitch({ className = '' }: { className?: string }) {
  const t = useTranslations('locale');
  const current = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [pending, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    startTransition(() => {
      // @ts-expect-error — params always match the current pathname
      router.replace({ pathname, params }, { locale, scroll: false });
    });
  }

  return (
    <div role="group" aria-label={t('label')} className={`label flex items-center gap-1 ${className}`} data-pending={pending || undefined}>
      {locales.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden className="opacity-40">/</span>}
          <button
            type="button"
            lang={locale}
            onClick={() => switchTo(locale)}
            aria-current={locale === current ? 'true' : undefined}
            aria-label={t(locale)}
            className={`min-h-11 px-1 transition-opacity duration-500 ${locale === current ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
          >
            {locale.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
