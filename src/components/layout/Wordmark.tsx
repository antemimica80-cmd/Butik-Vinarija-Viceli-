/** Typographic wordmark. Replace with the estate's logo SVG when supplied. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className="font-display text-[1.65rem] font-medium tracking-[0.2em] uppercase">Vicelić</span>
      <span className="label mt-1 text-[0.5625rem] tracking-[0.42em] opacity-70">Dingač · Pelješac</span>
    </span>
  );
}
