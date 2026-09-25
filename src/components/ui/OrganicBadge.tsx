import { organic } from '@content/home';

/** Small seal-like badge: "The only certified organic Dingač". */
export function OrganicBadge({ locale, tone = 'light', className = '' }: { locale: 'en' | 'hr'; tone?: 'light' | 'dark'; className?: string }) {
  const ring = tone === 'dark' ? 'border-sun-pale/50 text-sun-pale' : 'border-sun-deep/40 text-sun-deep';
  return (
    <span className={`label inline-flex items-center gap-2.5 rounded-full border px-4 py-2 ${ring} ${className}`}>
      <Leaf />
      {organic.badge[locale]}
    </span>
  );
}

export function Leaf({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 4C11 4 5 9 5 16c0 1.4.3 2.7.8 4" />
      <path d="M20 4c0 9-5 15-12 15-1 0-2-.1-2.9-.4" />
      <path d="M5.8 20C8 15 12 11 16 8.5" />
    </svg>
  );
}
