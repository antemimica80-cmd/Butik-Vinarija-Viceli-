export function Wordmark({ light = false, label }: { light?: boolean; label: string }) {
  const [first, ...rest] = label.split(" ");
  return (
    <span className="flex items-center gap-2.5">
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="19" fill={light ? "rgba(245,241,232,.12)" : "#193C34"} stroke={light ? "rgba(245,241,232,.6)" : "none"} />
        <path d="M9 25c4-5 7-6 11-6s7 1 11 6" fill="none" stroke="#BD9B65" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M11 29c3.5-3 6-3.8 9-3.8s5.5.8 9 3.8" fill="none" stroke="#BD9B65" strokeWidth="1.1" strokeLinecap="round" opacity=".7" />
        <circle cx="20" cy="13" r="3.2" fill="#792E39" />
        <circle cx="16.5" cy="14.8" r="2.2" fill="#792E39" opacity=".85" />
        <circle cx="23.5" cy="14.8" r="2.2" fill="#792E39" opacity=".85" />
      </svg>
      <span className="leading-none">
        <span className="block font-display text-[1.32rem] font-semibold tracking-tight">{first}</span>
        <span className={`mt-0.5 block text-[0.62rem] font-medium uppercase tracking-[0.22em] ${light ? "text-ivory/75" : "text-brass-700"}`}>{rest.join(" ")}</span>
      </span>
    </span>
  );
}
