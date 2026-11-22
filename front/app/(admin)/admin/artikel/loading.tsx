export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Memuat daftar artikel" className="w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-11 w-full max-w-xs rounded-full bg-admin-surface-muted motion-safe:animate-pulse" />
        <div className="h-11 w-32 rounded-full bg-admin-surface-muted motion-safe:animate-pulse" />
      </div>

      {/* Desktop 6-row table skeleton */}
      <div className="hidden space-y-3 md:block">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-4 border-b border-admin-line py-3">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-16 rounded-lg bg-admin-surface-muted motion-safe:animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-56 rounded bg-admin-surface-muted motion-safe:animate-pulse" />
                <div className="h-3 w-40 rounded bg-admin-surface-muted motion-safe:animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-16 rounded-full bg-admin-surface-muted motion-safe:animate-pulse" />
            <div className="h-4 w-24 rounded bg-admin-surface-muted motion-safe:animate-pulse" />
            <div className="h-4 w-24 rounded bg-admin-surface-muted motion-safe:animate-pulse" />
          </div>
        ))}
      </div>

      {/* Mobile 6-row stacked skeleton */}
      <div className="divide-y divide-admin-line border-y border-admin-line md:hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3 py-3.5">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-4/5 rounded bg-admin-surface-muted motion-safe:animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-admin-surface-muted motion-safe:animate-pulse" />
            </div>
            <div className="h-[42px] w-[56px] rounded bg-admin-surface-muted motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
