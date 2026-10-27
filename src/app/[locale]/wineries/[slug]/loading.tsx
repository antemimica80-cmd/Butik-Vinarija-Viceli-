export default function Loading() {
  return (
    <div aria-busy="true">
      <div className="skeleton h-[26rem] !rounded-none" />
      <div className="container-x grid gap-12 py-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4"><div className="skeleton h-10 w-3/4" /><div className="skeleton h-5 w-full" /><div className="skeleton h-5 w-5/6" /></div>
        <div className="skeleton h-80" />
      </div>
    </div>
  );
}
