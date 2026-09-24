import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { ArrowRight } from '@/components/ui/icons';

/** Home — stage 2 shows only the hero; the full descent is built in stage 3. */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'en' | 'hr');
  const t = await getTranslations();

  return (
    <>
      <section className="surface-shade relative flex min-h-[100svh] items-end overflow-hidden">
        <ImageSlot id="hero-video" fill priority labelTop className="opacity-90" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-basalt via-basalt/40 to-basalt/10" />
        <div className="container-x relative pt-[var(--nav-h)] pb-40 md:pb-28">
          <p className="label gate-in text-sun-pale">{t('home.heroEyebrow')}</p>
          <h1 className="gate-in mt-6 max-w-5xl text-display-xl font-light">{t('masterLine')}</h1>
          <div className="gate-in mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/experience" className="btn btn-sun">
              {t('home.heroPrimary')} <ArrowRight size={16} />
            </Link>
            <Link href="/dingac" className="btn btn-ghost">
              {t('home.heroSecondary')}
            </Link>
          </div>
        </div>
      </section>
      <section className="surface-sun grain py-32">
        <div className="container-x">
          <p className="label text-sun-deep">350 m — Ridge</p>
          <p className="mt-6 max-w-2xl text-lede text-ink-soft">{t('common.comingInStage', { stage: 3 })}</p>
        </div>
      </section>
    </>
  );
}
