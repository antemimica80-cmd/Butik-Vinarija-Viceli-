'use client';

import { useEffect, useState } from 'react';
import { site } from '@content/site';
import { CONSENT_EVENT } from '@/components/layout/ConsentBanner';
import { directionsUrl } from '@/lib/format';
import { getConsent, CONSENT_COOKIE, setCookie } from '@/lib/consent';

/**
 * Map of the estate. The third-party map (OpenStreetMap) loads only with consent
 * and only once coordinates are set in content/site.ts. Otherwise: a quiet
 * placeholder with the address and a directions link.
 */
export function MapBlock({ locale }: { locale: 'en' | 'hr' }) {
  const [allowed, setAllowed] = useState(false);
  const geo = site.address.geo;
  const address = `${site.address.street}, ${site.address.postalCode} ${site.address.city}, ${locale === 'hr' ? site.address.countryHr : site.address.country}`;

  useEffect(() => {
    const sync = () => setAllowed(getConsent() === 'all');
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  const t = {
    directions: locale === 'hr' ? 'Upute za dolazak' : 'Directions',
    load: locale === 'hr' ? 'Prikaži kartu' : 'Show map',
    note: locale === 'hr' ? 'Karta se učitava s OpenStreetMapa.' : 'The map loads from OpenStreetMap.',
    pending: locale === 'hr' ? 'Karta · potrebne su točne koordinate' : 'Map · exact coordinates needed',
  };

  return (
    <div className="grain relative aspect-[4/3] overflow-hidden bg-[#d9d1c3] text-ink-soft md:aspect-[16/10]">
      {geo && allowed ? (
        <iframe
          title={`${site.nameEn} — map`}
          className="absolute inset-0 size-full grayscale-[0.6] contrast-[0.95]"
          loading="lazy"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${geo.lng - 0.03}%2C${geo.lat - 0.018}%2C${geo.lng + 0.03}%2C${geo.lat + 0.018}&layer=mapnik&marker=${geo.lat}%2C${geo.lng}`}
        />
      ) : (
        <>
          <div className="absolute inset-3 border border-current opacity-20 md:inset-5" aria-hidden />
          <div className="absolute inset-x-6 bottom-6 md:inset-x-8 md:bottom-8">
            <p className="label">{geo ? t.note : t.pending}</p>
            <p className="mt-3 text-display-s font-light text-basalt">{address}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={directionsUrl(address)} target="_blank" rel="noopener noreferrer" className="btn btn-primary min-h-11 px-5">
                {t.directions}
              </a>
              {geo && (
                <button
                  type="button"
                  className="btn btn-ghost min-h-11 px-5"
                  onClick={() => {
                    setCookie(CONSENT_COOKIE, 'all');
                    document.documentElement.setAttribute('data-consent', 'all');
                    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: 'all' }));
                  }}
                >
                  {t.load}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
