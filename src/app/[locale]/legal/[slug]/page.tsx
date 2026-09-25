import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { legal, legalNotice } from '@content/legal';
import { alternates } from '@/lib/seo';

export const dynamicParams = false;
const slugs = Object.keys(legal) as (keyof typeof legal)[];

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/legal/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = legal[slug as keyof typeof legal];
  if (!page) return {};
  return {
    title: page.title[locale as Locale],
    alternates: alternates(locale as Locale, { pathname: '/legal/[slug]', params: { slug } }),
    robots: page.draft ? { index: false, follow: true } : undefined,
  };
}

export default async function LegalPageView({ params }: PageProps<'/[locale]/legal/[slug]'>) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const page = legal[slug as keyof typeof legal];
  if (!page) notFound();
  setRequestLocale(locale);
  const l = (x: { en: string; hr: string }) => x[locale];

  return (
    <section className="surface-limestone grain pt-[calc(var(--nav-h)+3rem)] pb-24 md:pt-[calc(var(--nav-h)+5rem)] md:pb-32">
      <div className="container-x max-w-3xl">
        {page.draft && (
          <p role="note" className="mb-10 border-l-2 border-plavac bg-bone px-4 py-3 text-sm">
            {l(legalNotice.draft)}
          </p>
        )}
        <h1 className="text-display-l font-light">{l(page.title)}</h1>
        <p className="mt-4 font-mono text-xs text-ink-soft">
          {l(legalNotice.updated)}: {page.updated}
        </p>
        <div className="mt-12 space-y-5 leading-relaxed">
          {page.blocks.map((b, i) => {
            if ('h' in b)
              return (
                <h2 key={i} className="pt-6 text-display-s font-light">
                  {l(b.h)}
                </h2>
              );
            if ('p' in b)
              return (
                <p key={i} className="text-ink-soft">
                  {l(b.p)}
                </p>
              );
            return (
              <ul key={i} className="list-disc space-y-2 pl-5 text-ink-soft marker:text-sun-deep">
                {b.ul.map((x, j) => (
                  <li key={j}>{l(x)}</li>
                ))}
              </ul>
            );
          })}
        </div>
      </div>
    </section>
  );
}
