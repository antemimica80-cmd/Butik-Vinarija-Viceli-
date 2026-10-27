import { WineryCard, type CardWinery } from "./WineryCard";

export function WineryGrid({ items, cols = 3 }: { items: CardWinery[]; cols?: 2 | 3 | 4 }) {
  const c = cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <ul className={`grid gap-6 ${c}`}>
      {items.map((w) => <li key={w.id}><WineryCard w={w} /></li>)}
    </ul>
  );
}
