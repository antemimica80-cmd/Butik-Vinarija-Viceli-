"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { Icon } from "../Icon";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Wordmark } from "./Wordmark";

type Labels = Record<
  "wineries" | "map" | "regions" | "grapes" | "wines" | "experiences" | "routes" | "stories" | "awards" | "account" | "login" |
  "owner" | "admin" | "menu" | "close" | "switchTo" | "switchToShort" | "language" | "mainNav" | "listWinery" | "siteName" | "planner",
  string
>;

const NAV = [
  { href: "/wineries", key: "wineries" },
  { href: "/map", key: "map" },
  { href: "/regions", key: "regions" },
  { href: "/grapes", key: "grapes" },
  { href: "/wines", key: "wines" },
  { href: "/experiences", key: "experiences" },
  { href: "/routes", key: "routes" },
  { href: "/stories", key: "stories" },
] as const;

export function HeaderBar({ labels, user }: { labels: Labels; user: { name: string; role: string } | null }) {
  const pathname = usePathname();
  const overlay = pathname === "/";
  const fullBleed = pathname === "/map";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Close the mobile menu on navigation (state derived during render, per React guidance).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) { setMenuPath(pathname); setOpen(false); }
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  const transparent = overlay && !scrolled && !open;
  const tone = transparent ? "text-ivory" : "text-ink";
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
    <header
      className={`${overlay ? "fixed" : "sticky"} inset-x-0 top-0 z-50 transition-colors duration-300 ${
        transparent ? "bg-transparent" : "border-b border-line/80 bg-ivory/90 backdrop-blur-md"
      } ${tone}`}
    >
      <div className={`${fullBleed ? "px-4 md:px-6" : "container-x"} flex h-16 items-center gap-4 md:h-[4.5rem]`}>
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={labels.siteName}>
          <Wordmark light={transparent} label={labels.siteName} />
        </Link>
        <nav aria-label={labels.mainNav} className="ml-4 hidden flex-1 items-center gap-1 xl:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`rounded-full px-3 py-2 text-[0.92rem] transition-colors ${
                isActive(n.href) ? (transparent ? "bg-ivory/15" : "bg-forest-100 text-forest") : transparent ? "hover:bg-ivory/10" : "hover:bg-paper"
              }`}
              aria-current={isActive(n.href) ? "page" : undefined}>
              {labels[n.key]}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <LanguageSwitcher label={labels.switchTo} short={labels.switchToShort} light={transparent} />
          {user ? (
            <Link href={user.role === "admin" || user.role === "editor" ? "/admin" : user.role === "owner" ? "/owner" : "/account"}
              className={`hidden items-center gap-2 rounded-full px-3 py-2 text-sm sm:flex ${transparent ? "hover:bg-ivory/10" : "hover:bg-paper"}`}>
              <Icon name="user" size={18} />
              <span className="max-w-[9rem] truncate">{user.name}</span>
            </Link>
          ) : (
            <Link href="/login" className={`hidden rounded-full px-3 py-2 text-sm sm:inline-flex ${transparent ? "hover:bg-ivory/10" : "hover:bg-paper"}`}>
              {labels.login}
            </Link>
          )}
          <Link href="/map" className={`btn btn-sm hidden md:inline-flex ${transparent ? "btn-light" : "btn-primary"}`}>
            <Icon name="map" size={16} /> {labels.map}
          </Link>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav"
            className={`grid h-11 w-11 place-items-center rounded-full xl:hidden ${transparent ? "hover:bg-ivory/10" : "hover:bg-paper"}`}>
            <Icon name={open ? "x" : "menu"} size={22} />
            <span className="sr-only">{open ? labels.close : labels.menu}</span>
          </button>
        </div>
      </div>
    </header>
    {/* Rendered outside <header>: its backdrop-filter would otherwise contain this fixed panel. */}
    {open && (
      <div id="mobile-nav" className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-ivory text-ink md:top-[4.5rem] xl:hidden">
        <nav aria-label={labels.mainNav} className="container-x py-6">
          <ul className="divide-y divide-line">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="flex items-center justify-between py-4 font-display text-3xl text-forest">
                  {labels[n.key]} <Icon name="arrowRight" size={20} className="text-brass-700" />
                </Link>
              </li>
            ))}
            <li><Link href="/awards" className="block py-4 font-display text-3xl text-forest">{labels.awards}</Link></li>
            <li><Link href="/routes/planner" className="block py-4 font-display text-3xl text-forest">{labels.planner}</Link></li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <Link href="/account" className="btn btn-ghost"><Icon name="user" size={18} /> {labels.account}</Link>
            ) : (
              <Link href="/login" className="btn btn-ghost">{labels.login}</Link>
            )}
            <Link href="/list-your-winery" className="btn btn-ghost">{labels.listWinery}</Link>
          </div>
        </nav>
      </div>
    )}
    </>
  );
}
