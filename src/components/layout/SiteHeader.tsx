'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { CloseIcon, MenuIcon, ArrowRight } from '@/components/ui/icons';
import { CartButton } from './CartButton';
import { LocaleSwitch } from './LocaleSwitch';
import { Wordmark } from './Wordmark';
import { navItems } from './nav-items';

/** Pages whose first section is a dark full-bleed hero: the header starts transparent over it. */
const overlayPaths = new Set(['/', '/design']);

export function SiteHeader() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // The menu is open for the pathname it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Over sections marked data-nav-tone="dark" (the hero, the tunnel) the header goes transparent.
  const [overDark, setOverDark] = useState<boolean | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const probe = 36;
      const dark = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-tone="dark"]')).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= probe && r.bottom >= probe;
      });
      setOverDark(dark);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('vicelic:navtone', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('vicelic:navtone', onScroll);
    };
  }, []);

  // Mobile menu: lock scroll, trap focus, close on Escape
  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    document.documentElement.style.overflow = 'hidden';
    const focusables = () => Array.from(menu?.querySelectorAll<HTMLElement>('a, button') ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenOn(null);
        toggleRef.current?.focus();
      }
      if (e.key === 'Tab') {
        const els = focusables();
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Before hydration, fall back to the per-page default so the first paint matches the hero.
  const overlay = overDark ?? (overlayPaths.has(pathname) && !scrolled);

  return (
    <>
      <a href="#main" className="label sr-only z-[70] bg-basalt px-4 py-3 text-bone focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        {t('skipToContent')}
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,color,box-shadow] duration-700 ease-[var(--ease-weighted)] ${
          overlay ? 'on-dark bg-transparent text-bone' : 'bg-bone/95 text-basalt shadow-[0_1px_0_rgb(18_17_16/0.08)] backdrop-blur-sm'
        }`}
      >
        <div className="container-x flex h-[var(--nav-h)] items-center justify-between gap-6">
          <Link href="/" aria-label={t('home')} className="shrink-0">
            <Wordmark />
          </Link>

          <nav aria-label={t('primary')} className="hidden lg:block">
            <ul className="flex items-center gap-4 xl:gap-8">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`label relative py-2 tracking-[0.16em] transition-opacity duration-500 hover:opacity-100 xl:tracking-[0.22em] ${active ? 'opacity-100' : 'opacity-75'}`}
                    >
                      {t(item.key)}
                      {active && <span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-px bg-current" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2 lg:gap-4">
            <LocaleSwitch className="hidden sm:flex" />
            <CartButton />
            <Link href="/experience" className={`btn hidden min-h-11 px-5 lg:inline-flex ${overlay ? 'btn-sun' : 'btn-primary'}`}>
              <span className="xl:hidden">{t('bookShort')}</span>
              <span className="hidden xl:inline">{t('book')}</span>
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="-mr-2 inline-flex size-11 items-center justify-center lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t('close') : t('menu')}
              onClick={() => setOpen(!open)}
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — full-screen, dark, big serif */}
      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('menu')}
        hidden={!open}
        className="surface-shade grain fixed inset-0 z-50 flex flex-col overflow-y-auto lg:hidden"
      >
        <div className="container-x flex h-[var(--nav-h)] shrink-0 items-center justify-between">
          <Link href="/" aria-label={t('home')}>
            <Wordmark />
          </Link>
          <button
            type="button"
            className="-mr-2 inline-flex size-11 items-center justify-center"
            aria-label={t('close')}
            onClick={() => {
              setOpen(false);
              toggleRef.current?.focus();
            }}
          >
            <CloseIcon size={24} />
          </button>
        </div>
        <nav aria-label={t('primary')} className="container-x flex flex-1 flex-col justify-center py-10">
          <ul className="space-y-1">
            {navItems.map((item, i) => (
              <li key={item.href} className="menu-item" style={{ animationDelay: `${120 + i * 70}ms` }}>
                <Link href={item.href} className="font-display block py-1.5 text-[2.5rem] leading-tight font-light">
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="container-x flex shrink-0 items-center justify-between gap-4 pb-8">
          <LocaleSwitch />
          <Link href="/experience" className="btn btn-sun">
            {t('book')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}
