import LoadingStateTracker from "@/components/ui/LoadingStateTracker";

// Skeletons mirror the final layouts (3.10) so swapping in content does not shift the page.
// Shimmer is CSS (.admin-skeleton in globals.css) and stops under reduced motion.

function Bone({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`admin-skeleton rounded-full ${className}`} />;
}

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return <div role="status" aria-live="polite" aria-busy="true" className="select-none">
    <LoadingStateTracker />
    <span className="sr-only">{label}</span>
    {children}
  </div>;
}

export function SkeletonList({ rows = 6 }: { rows?: number }) {
  return <Frame label="Memuat daftar…">
    <div className="mb-5 flex gap-3"><Bone className="h-14 w-72" /><Bone className="h-14 flex-1" /></div>
    <div className="rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]">
      {Array.from({ length: rows }, (_, index) => <div key={index} className="flex items-center gap-4 border-b border-admin-line py-4 last:border-0">
        <Bone className="size-10 shrink-0" />
        <div className="flex-1 space-y-2"><Bone className="h-3.5 w-1/3" /><Bone className="h-3 w-1/5" /></div>
        <Bone className="hidden h-7 w-24 md:block" />
        <Bone className="h-3.5 w-20" />
      </div>)}
    </div>
  </Frame>;
}

export function SkeletonCards({ cards = 6 }: { cards?: number }) {
  return <Frame label="Memuat kartu…">
    <div className="grid gap-[var(--admin-gap-card)] sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: cards }, (_, index) => <div key={index} className="space-y-4 rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]">
        <div aria-hidden="true" className="admin-skeleton aspect-[4/3] rounded-[var(--admin-radius-card-inner)]" />
        <Bone className="h-4 w-2/3" /><Bone className="h-3 w-1/2" />
      </div>)}
    </div>
  </Frame>;
}

export function SkeletonForm({ sections = 2, fields = 4 }: { sections?: number; fields?: number }) {
  return <Frame label="Memuat formulir…">
    <div className="space-y-[var(--admin-gap-section)]">
      {Array.from({ length: sections }, (_, section) => <div key={section} className="space-y-5 rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]">
        <Bone className="h-4 w-40" />
        {Array.from({ length: fields }, (_, field) => <div key={field} className="space-y-2"><Bone className="h-3 w-28" /><Bone className="h-[52px] w-full" /></div>)}
      </div>)}
    </div>
  </Frame>;
}

export function SkeletonDashboard() {
  return <Frame label="Memuat statistik…">
    <div className="space-y-[var(--admin-gap-card)]">
      <div className="grid gap-[var(--admin-gap-card)] sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-[188px] space-y-4 rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]">
          <Bone className="h-12 w-24" /><Bone className="h-3.5 w-32" /><Bone className="h-6 w-20" />
        </div>)}
      </div>
      <div className="grid gap-[var(--admin-gap-card)] xl:grid-cols-3">
        <div className="h-[380px] rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)] xl:col-span-2"><Bone className="h-4 w-48" /><div aria-hidden="true" className="admin-skeleton mt-8 h-[260px] rounded-[var(--admin-radius-card-inner)]" /></div>
        <div className="h-[380px] space-y-5 rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]">
          <Bone className="h-4 w-36" />{Array.from({ length: 5 }, (_, index) => <Bone key={index} className="h-10 w-full" />)}
        </div>
      </div>
      <div className="grid gap-[var(--admin-gap-card)] lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-[260px] space-y-5 rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]">
          <Bone className="h-4 w-40" />{Array.from({ length: 4 }, (_, row) => <div key={row} className="space-y-2"><Bone className="h-3 w-1/2" /><Bone className="h-2 w-full" /></div>)}
        </div>)}
      </div>
    </div>
  </Frame>;
}
