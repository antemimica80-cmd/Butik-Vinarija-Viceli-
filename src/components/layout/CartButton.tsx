'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CartIcon } from '@/components/ui/icons';
import { useCartCount } from '@/lib/cart';

export function CartButton({ className = '' }: { className?: string }) {
  const t = useTranslations('nav');
  const count = useCartCount();
  return (
    <Link href="/shop" aria-label={t('cartCount', { count })} className={`relative inline-flex size-11 items-center justify-center ${className}`}>
      <CartIcon size={22} />
      {count > 0 && (
        <span className="absolute top-1.5 right-1 flex size-4 items-center justify-center rounded-full bg-sun text-[0.625rem] font-semibold text-basalt">
          {count}
        </span>
      )}
    </Link>
  );
}
