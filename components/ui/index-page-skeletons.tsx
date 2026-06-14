import { Skeleton } from "@/components/ui/skeleton";

function HeaderSkeleton({ titleWidth = "w-64" }: { titleWidth?: string }) {
  return (
    <div className="mb-12 text-center">
      <div className="mb-5 flex justify-center">
        <Skeleton className="h-7 w-36 rounded-full border border-primary/20 bg-primary/10" />
      </div>
      <Skeleton className={`mx-auto h-10 ${titleWidth} max-w-full rounded-sm bg-primary/10`} />
      <Skeleton className="mx-auto mt-5 h-4 w-full max-w-2xl rounded-sm bg-secondary/60" />
      <Skeleton className="mx-auto mt-2 h-4 w-full max-w-xl rounded-sm bg-secondary/50" />
    </div>
  );
}

function FilterRowSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="mb-12 space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36 rounded-sm bg-primary/10" />
        <Skeleton className="h-4 w-24 rounded-sm bg-secondary/50" />
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="space-y-2">
          <Skeleton className="h-3 w-20 rounded-sm bg-secondary/50" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: rowIndex === 0 ? 5 : 8 }).map((__, itemIndex) => (
              <Skeleton
                key={itemIndex}
                className="h-8 rounded-full border border-border/30 bg-secondary/50"
                style={{ width: `${64 + ((itemIndex + rowIndex) % 4) * 18}px` }}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="border-t border-border/30 pt-4">
        <Skeleton className="h-4 w-44 rounded-sm bg-secondary/50" />
      </div>
    </div>
  );
}

function ProjectCardSkeleton() {
  return (
    <div className="h-full overflow-hidden rounded-lg border border-border/30 bg-card/90 backdrop-blur-sm">
      <Skeleton className="h-48 w-full rounded-none bg-secondary/60" />
      <div className="space-y-4 p-6">
        <Skeleton className="h-5 w-28 rounded-full border border-primary/20 bg-primary/10" />
        <Skeleton className="h-7 w-4/5 rounded-sm bg-secondary/60" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-sm bg-secondary/50" />
          <Skeleton className="h-4 w-5/6 rounded-sm bg-secondary/50" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-sm bg-secondary/50" />
          <Skeleton className="h-6 w-20 rounded-sm bg-secondary/50" />
          <Skeleton className="h-6 w-14 rounded-sm bg-secondary/50" />
        </div>
        <div className="border-t border-border/30 pt-4">
          <Skeleton className="h-9 w-full rounded-sm border border-primary/20 bg-primary/10" />
        </div>
      </div>
    </div>
  );
}

export function ProjectsIndexSkeleton() {
  return (
    <div className="min-h-screen pt-4 pb-20" role="status" aria-live="polite" aria-label="Memuat proyek">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HeaderSkeleton titleWidth="w-80" />
        <FilterRowSkeleton rows={3} />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BlogFeaturedSkeleton() {
  return (
    <div className="mb-16 overflow-hidden rounded-xl border border-border/20 bg-card/80 shadow-2xl shadow-black/30">
      <div className="relative h-[340px] md:h-[440px]">
        <Skeleton className="h-full w-full rounded-none bg-secondary/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
        <div className="absolute left-6 right-6 bottom-6 space-y-4 md:left-10 md:right-10 md:bottom-10">
          <Skeleton className="h-6 w-28 rounded-sm border border-primary/20 bg-primary/20" />
          <Skeleton className="h-10 w-full max-w-2xl rounded-sm bg-white/15" />
          <Skeleton className="h-4 w-full max-w-xl rounded-sm bg-white/10" />
          <Skeleton className="h-4 w-3/4 max-w-lg rounded-sm bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/20 bg-card/80 backdrop-blur-sm">
      <Skeleton className="h-48 w-full rounded-none bg-secondary/60" />
      <div className="space-y-4 p-5">
        <Skeleton className="h-3 w-32 rounded-sm bg-secondary/50" />
        <Skeleton className="h-6 w-5/6 rounded-sm bg-secondary/60" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-sm bg-secondary/50" />
          <Skeleton className="h-4 w-4/5 rounded-sm bg-secondary/50" />
        </div>
        <div className="flex items-center gap-4 border-t border-border/10 pt-3">
          <Skeleton className="h-3 w-12 rounded-sm bg-secondary/50" />
          <Skeleton className="h-3 w-12 rounded-sm bg-secondary/50" />
          <Skeleton className="ml-auto h-3 w-12 rounded-sm bg-primary/10" />
        </div>
      </div>
    </div>
  );
}

function BlogSidebarSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/20 bg-card/80 p-5">
        <Skeleton className="mb-5 h-5 w-32 rounded-sm bg-primary/10" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-full rounded-md bg-secondary/50" />
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border/20 bg-card/80 p-5">
        <Skeleton className="mb-4 h-3 w-24 rounded-sm bg-secondary/50" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-lg border border-primary/10 bg-primary/10" />
          <Skeleton className="h-20 rounded-lg border border-primary/10 bg-primary/10" />
        </div>
      </div>
    </div>
  );
}

export function BlogIndexSkeleton() {
  return (
    <div className="min-h-screen pt-4 pb-20" role="status" aria-live="polite" aria-label="Memuat artikel">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HeaderSkeleton titleWidth="w-80" />
        <BlogFeaturedSkeleton />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          <div className="space-y-8 lg:col-span-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-sm bg-primary/10" />
              <Skeleton className="h-6 w-48 rounded-sm bg-secondary/60" />
              <Skeleton className="h-5 w-20 rounded-sm border border-primary/20 bg-primary/10" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <BlogCardSkeleton key={index} />
              ))}
            </div>
          </div>
          <BlogSidebarSkeleton />
        </div>
      </div>
    </div>
  );
}
