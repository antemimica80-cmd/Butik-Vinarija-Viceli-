import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { site } from '@content/site';
import { navItems } from './nav-items';
import { Wordmark } from './Wordmark';
import { CookieSettingsButton } from './CookieSettingsButton';

const legal = [
  { slug: 'terms', key: 'terms' },
  { slug: 'privacy', key: 'privacy' },
  { slug: 'cookies', key: 'cookies' },
  { slug: 'imprint', key: 'imprint' },
] as const;

export function SiteFooter() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="surface-shade grain pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="container-x pt-20 pb-12 md:pt-28">
        <p className="font-display max-w-3xl text-display-m font-light">{t('masterLine')}</p>
        <p className="mt-6 max-w-md text-stone-light">{t('footer.tagline')}</p>

        <hr className="rule mt-16 mb-12" />

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="label text-sun">{t('footer.visit')}</h2>
            <address className="mt-4 not-italic leading-relaxed text-bone/85">
              {site.address.street}
              <br />
              {site.address.postalCode} {site.address.city}, {site.address.region}
              <br />
              {site.address.country}
            </address>
            <p className="mt-4 text-sm text-stone-light">{t('footer.season')}</p>
          </div>

          <div>
            <h2 className="label text-sun">{t('footer.contact')}</h2>
            <ul className="mt-4 space-y-2 text-bone/85">
              <li>
                <a href={site.phoneHref} className="hover:text-bone">
                  {site.phone}
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-bone">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="break-all hover:text-bone">
                  {site.email}
                </a>
              </li>
              <li>
                <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="hover:text-bone">
                  Instagram {site.instagram.handle}
                </a>
              </li>
            </ul>
          </div>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="label text-sun">
              {t('footer.explore')}
            </h2>
            <ul className="mt-4 space-y-2 text-bone/85">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-bone">
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal">
            <h2 id="footer-legal" className="label text-sun">
              {t('footer.legal')}
            </h2>
            <ul className="mt-4 space-y-2 text-bone/85">
              {legal.map((l) => (
                <li key={l.slug}>
                  <Link href={{ pathname: '/legal/[slug]', params: { slug: l.slug } }} className="hover:text-bone">
                    {t(`footer.${l.key}`)}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsButton label={t('footer.cookieSettings')} />
              </li>
            </ul>
          </nav>
        </div>

        <hr className="rule mt-16 mb-8" />

        <div className="flex flex-col gap-6 text-xs text-stone-light md:flex-row md:items-end md:justify-between">
          <Wordmark className="text-bone" />
          <p className="max-w-md md:text-right">
            {t('footer.responsible')}
            <br />© {year} {site.legalName}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
