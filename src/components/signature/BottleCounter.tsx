import { Reveal } from '@/components/ui/Reveal';

type Props = { count: number; unit: string; tail: string; note: string; locale: string };

/** Scarcity, stated plainly: "9,500 bottles. Worldwide." */
export function BottleCounter({ count, unit, tail, note, locale }: Props) {
  const formatted = new Intl.NumberFormat(locale === 'hr' ? 'hr-HR' : 'en-US').format(count);
  return (
    <section className="surface-plavac grain overflow-hidden py-28 md:py-44">
      <div className="container-x">
        <Reveal>
          <p className="text-[clamp(4.5rem,2rem+14vw,15rem)] leading-[0.85] font-extralight tracking-[-0.04em]" style={{ fontFamily: 'var(--font-display)' }}>
            {formatted}
          </p>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-6 text-display-m font-light">
            {unit} <span className="text-sun-pale italic">{tail}</span>
          </p>
        </Reveal>
        <Reveal delay={400}>
          <p className="mt-8 max-w-md text-bone/75">{note}</p>
        </Reveal>
      </div>
    </section>
  );
}
