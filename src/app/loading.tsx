export default function Loading() {
  return (
    <div className="container-page py-10" aria-busy="true" aria-label="Загрузка страницы">
      <div className="h-3 w-40 animate-pulse rounded bg-surface2" />
      <div className="mt-6 h-9 w-2/3 max-w-xl animate-pulse rounded-lg bg-surface2" />
      <div className="mt-3 h-4 w-1/2 max-w-md animate-pulse rounded bg-surface2" />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-xl bg-surface2" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/2 animate-pulse rounded bg-surface2" />
                <div className="h-2.5 w-3/4 animate-pulse rounded bg-surface2" />
              </div>
            </div>
            <div className="mt-4 aspect-[16/10] animate-pulse rounded-lg bg-surface2" />
            <div className="mt-4 space-y-2">
              <div className="h-2.5 w-full animate-pulse rounded bg-surface2" />
              <div className="h-2.5 w-5/6 animate-pulse rounded bg-surface2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
