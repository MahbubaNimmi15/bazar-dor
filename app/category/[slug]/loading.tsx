export default function Loading() {
  return (
    <main className="min-h-screen bg-[#fffdf7] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Back button skeleton */}
        <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />

        {/* Header skeleton */}
        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />

            <div className="mt-4 h-8 w-40 animate-pulse rounded bg-slate-200" />

            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-200" />
          </div>

          <div>
            <div className="mb-2 h-4 w-16 animate-pulse rounded bg-slate-200" />
            <div className="h-12 w-56 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>

        {/* Product card skeletons */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />

              <div className="mt-4 h-5 w-32 animate-pulse rounded bg-slate-200" />

              <div className="mt-2 h-4 w-20 animate-pulse rounded bg-slate-200" />

              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />

                  <div className="mt-2 h-6 w-24 animate-pulse rounded bg-slate-200" />
                </div>

                <div className="h-7 w-16 animate-pulse rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}