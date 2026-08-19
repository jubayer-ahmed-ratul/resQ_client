export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="animate-pulse space-y-2" aria-busy="true" aria-label="Loading…">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-10 flex-1 rounded-xl bg-gray-200"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Card-style skeleton — used for grid layouts (hospitals, resources) */
export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="animate-pulse grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading…"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border bg-white p-5 space-y-3"
          style={{ borderColor: "rgba(11,31,51,0.08)" }}
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-gray-200" />
            <div className="h-5 w-20 rounded-full bg-gray-200" />
          </div>
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-3 w-1/2 rounded bg-gray-200" />
          <div className="space-y-2 pt-1">
            <div className="h-2 w-full rounded bg-gray-200" />
            <div className="h-2 w-full rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Two-column card skeleton — used for hospitals */
export function HospitalCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="animate-pulse grid grid-cols-1 gap-4 lg:grid-cols-2"
      aria-busy="true"
      aria-label="Loading…"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border bg-white p-5 space-y-4"
          style={{ borderColor: "rgba(11,31,51,0.08)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-36 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-200" />
              </div>
            </div>
            <div className="h-5 w-24 rounded-full bg-gray-200" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
