'use client';

import { useEffect, useRef, type ElementType, type ReactNode, type CSSProperties } from 'react';

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Delay in ms, for staggering siblings. */
  delay?: number;
  /** Fade only, no rise. */
  fade?: boolean;
  /** Above the fold: animate on load with CSS only, so it never waits for JavaScript (better LCP). */
  immediate?: boolean;
};

/** Slow, weighted fade-and-rise when the element enters the viewport. */
export function Reveal({ as: Tag = 'div', children, className = '', delay = 0, fade, immediate }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || immediate) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = 'true';
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);

  if (immediate) {
    return (
      <Tag className={`gate-in ${className}`} style={{ animationDelay: `${150 + delay}ms` }}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={`reveal ${fade ? 'reveal-fade' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
