/** Skeleton matching the directory layout to avoid layout shift. */
export default function Loading() {
  return (
    <div className="container-x pb-10 pt-12" aria-busy="true">
      <div className="skeleton h-14 w-80" />
      <div className="skeleton mt-4 h-6 w-[32rem] max-w-full" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[18rem_1fr]">
        <div className="hidden space-y-3 lg:block">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-10" />)}</div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-[1.4rem] border border-line bg-paper">
              <div className="skeleton aspect-[4/3] !rounded-none" />
              <div className="space-y-3 p-5"><div className="skeleton h-3 w-24" /><div className="skeleton h-7 w-48" /><div className="skeleton h-4 w-full" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
