import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { shopCopy as S } from '@content/products';
import { CartView } from '@/components/shop/CartView';
import { stripeEnabled } from '@/lib/stripe';

export const metadata: Metadata = { title: 'Cart', robots: { index: false } };

export default async function CartPage({ params }: PageProps<'/[locale]/shop/cart'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  return (
    <section className="surface-limestone grain min-h-[80svh] pt-[calc(var(--nav-h)+3rem)] pb-20 md:pt-[calc(var(--nav-h)+5rem)]">
      <div className="container-x">
        <h1 className="mb-10 text-display-m font-light">{S.cart.title[locale]}</h1>
        <CartView locale={locale} demo={!stripeEnabled()} />
      </div>
    </section>
  );
}
