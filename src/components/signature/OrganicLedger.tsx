import type { CSSProperties } from 'react';
import { organic } from '@content/home';
import { Leaf } from '@/components/ui/OrganicBadge';
import { Reveal } from '@/components/ui/Reveal';

/**
 * "What is not in the bottle": the conventional inputs, struck through one by one
 * as the card comes into view, then what is left. Stands in for a photograph in
 * the organic sections — it is the claim itself, set in type.
 */
export function OrganicLedger({ locale, className = '' }: { locale: 'en' | 'hr'; className?: string }) {
  const L = organic.ledger;
  return (
    <Reveal fade className={`organic-ledger surface-plavac grain relative overflow-hidden p-7 sm:p-10 ${className}`}>
      <div aria-hidden className="absolute -top-10 -right-10 size-40 text-sun-pale/35 sm:size-48">
        <svg viewBox="0 0 120 120" className="ledger-seal size-full" fill="none" stroke="currentColor">
          <defs>
            <path id="ledger-ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
          </defs>
          <circle cx="60" cy="60" r="56" strokeWidth="0.75" />
          <circle cx="60" cy="60" r="34" strokeWidth="0.5" />
          <text fill="currentColor" stroke="none" fontFamily="var(--font-mono)" fontSize="7.6" letterSpacing="2.4">
            <textPath href="#ledger-ring">{L.seal + L.seal.slice(0, 12)}</textPath>
          </text>
        </svg>
        <span className="absolute inset-0 grid place-items-center text-sun-pale/70">
          <Leaf size={26} />
        </span>
      </div>

      <p className="label text-sun-pale">{L.notTitle[locale]}</p>
      <ul className="mt-8 space-y-2.5">
        {L.not.map((x, i) => (
          <li key={x.en} className="text-display-s font-light text-bone/55">
            <s className="ledger-strike" style={{ '--i': i } as CSSProperties}>
              {x[locale]}
            </s>
          </li>
        ))}
      </ul>

      <div className="mt-10 border-t border-bone/20 pt-6">
        <p className="label text-sun-pale">{L.isTitle[locale]}</p>
        <p className="ledger-is mt-4 text-display-m font-light text-bone italic">{L.is[locale]}</p>
      </div>
    </Reveal>
  );
}
