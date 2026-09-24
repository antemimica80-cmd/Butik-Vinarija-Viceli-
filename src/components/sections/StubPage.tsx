import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PageIntro } from './PageIntro';

type Key = 'experience' | 'dingac' | 'family' | 'wines' | 'shop' | 'visit' | 'legal';

/** Temporary page shell until the page is built in its stage. */
export function StubPage({ page, stage }: { page: Key; stage: number }) {
  const t = useTranslations();
  return (
    <>
      <PageIntro eyebrow={t(`stub.${page}.eyebrow`)} title={t(`stub.${page}.title`)}>
        <p className="text-ink-soft">{t('common.comingInStage', { stage })}</p>
      </PageIntro>
      <section className="surface-sun pb-32">
        <div className="container-x">
          <Link href="/" className="btn-link">
            {t('common.backHome')}
          </Link>
        </div>
      </section>
    </>
  );
}
