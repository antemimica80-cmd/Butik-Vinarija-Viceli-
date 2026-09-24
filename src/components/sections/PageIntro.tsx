import type { ReactNode } from 'react';
import { Reveal } from '@/components/ui/Reveal';

type Props = { eyebrow: string; title: string; children?: ReactNode; tone?: 'sun' | 'shade' };

/** Standard page opening: station label, large display title, optional lede. */
export function PageIntro({ eyebrow, title, children, tone = 'sun' }: Props) {
  return (
    <section className={`${tone === 'shade' ? 'surface-shade' : 'surface-sun'} grain pt-[calc(var(--nav-h)+4rem)] pb-16 md:pt-[calc(var(--nav-h)+7rem)] md:pb-24`}>
      <div className="container-x">
        <Reveal>
          <p className={`label ${tone === 'shade' ? 'text-sun' : 'text-sun-deep'}`}>{eyebrow}</p>
          <h1 className="mt-6 text-display-xl font-light">{title}</h1>
        </Reveal>
        {children && (
          <Reveal delay={150} className="mt-8 max-w-2xl text-lede">
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}
