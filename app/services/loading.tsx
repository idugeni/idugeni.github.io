import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesLoading() {
  return (
    <div className="pt-4 pb-20 min-h-screen" role="status" aria-live="polite" aria-label="Memuat layanan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <Skeleton className="mx-auto h-7 w-44 rounded-full border border-primary/20 bg-primary/10" />
          <Skeleton className="mx-auto mt-4 h-10 w-72 rounded-sm bg-primary/10" />
          <Skeleton className="mx-auto mt-3 h-4 w-96 max-w-full rounded-sm bg-secondary/50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-border/50 bg-card/80 p-6">
              <Skeleton className="h-4 w-8 rounded-sm bg-primary/10 mb-4" />
              <Skeleton className="h-5 w-40 rounded-sm bg-secondary/60 mb-3" />
              <Skeleton className="h-4 w-full rounded-sm bg-secondary/50 mb-2" />
              <Skeleton className="h-4 w-4/5 rounded-sm bg-secondary/50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
