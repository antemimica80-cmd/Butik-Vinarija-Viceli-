import { BASE_PATH } from '@/lib/static';

/**
 * The estate's round seal (Boutique Winery Vicelić). Drawn as a mask, so it takes
 * the current text colour — bone on dark sections, basalt or plavac on light ones.
 */
export function LogoSeal({ className = '', small, label }: { className?: string; small?: boolean; label?: string }) {
  const url = `${BASE_PATH}/media/${small ? 'logo-seal-160.png' : 'logo-seal.png'}`;
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{ WebkitMask: `url(${url}) center / contain no-repeat`, mask: `url(${url}) center / contain no-repeat` }}
    />
  );
}
