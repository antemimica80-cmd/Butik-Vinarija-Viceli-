/** A round estate seal, like a stamp on an archive file. */
export function Seal({ text, center, className = '' }: { text: string; center: string; className?: string }) {
  const id = `seal-${center.replace(/\W/g, '')}`;
  return (
    <svg viewBox="0 0 120 120" className={`seal ${className}`} aria-hidden fill="none" stroke="currentColor">
      <defs>
        <path id={id} d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
      </defs>
      <circle cx="60" cy="60" r="56" strokeWidth="0.75" />
      <circle cx="60" cy="60" r="34" strokeWidth="0.5" />
      <text fill="currentColor" stroke="none" fontFamily="var(--font-mono)" fontSize="8.2" letterSpacing="2.6">
        <textPath href={`#${id}`}>{text}</textPath>
      </text>
      <text x="60" y="64" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontSize="15">
        {center}
      </text>
    </svg>
  );
}
