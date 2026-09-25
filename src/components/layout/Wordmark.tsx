import { LogoSeal } from './LogoSeal';

/** The estate seal with the typographic name beside it. */
export function Wordmark({ className = '', seal = true }: { className?: string; seal?: boolean }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      {seal && <LogoSeal small className="size-10 md:size-11 lg:hidden xl:inline-block" />}
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.5rem] font-medium tracking-[0.2em] uppercase md:text-[1.65rem]">Vicelić</span>
        <span className="label mt-1 text-[0.5625rem] tracking-[0.42em] opacity-70">Dingač · Pelješac</span>
      </span>
    </span>
  );
}
