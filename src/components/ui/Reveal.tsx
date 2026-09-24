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
};

/** Slow, weighted fade-and-rise when the element enters the viewport. */
export function Reveal({ as: Tag = 'div', children, className = '', delay = 0, fade }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
  }, []);

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
