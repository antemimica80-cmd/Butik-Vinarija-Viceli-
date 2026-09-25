'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { ArrowRight, WhatsAppIcon } from '@/components/ui/icons';
import { site } from '@content/site';

/** Pages where the sticky booking bar would duplicate the page's own booking flow. */
const hideBookBarOn = (p: string) => p === '/experience' || p.startsWith('/experience/');

/**
 * Persistent actions: a sticky "Book a tasting" bar on mobile and a floating
 * WhatsApp button (sits above the bar on mobile).
 */
export function FloatingActions() {
  const t = useTranslations();
  const pathname = usePathname();
  const showBar = !hideBookBarOn(pathname);
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t('whatsapp.prefill'))}`;

  return (
    <>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('whatsapp.label')}
        className={`wa-fab fixed right-4 z-30 inline-flex size-13 items-center justify-center rounded-full bg-basalt text-bone shadow-[0_8px_30px_rgb(0_0_0/0.25)] ring-1 ring-bone/15 transition-transform duration-500 hover:scale-105 md:right-6 md:bottom-6 ${
          showBar ? 'bottom-[calc(4.75rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(1rem+env(safe-area-inset-bottom))]'
        }`}
      >
        <WhatsAppIcon size={24} />
      </a>

      {showBar && (
        <div className="fixed inset-x-0 bottom-0 z-30 bg-plavac pb-[env(safe-area-inset-bottom)] text-bone md:hidden">
          <Link href="/experience" className="btn flex h-15 w-full justify-between px-[var(--gutter)]">
            <span>{t('nav.book')}</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </>
  );
}
