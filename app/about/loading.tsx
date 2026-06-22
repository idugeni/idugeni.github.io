import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <div className="pt-4 pb-20 min-h-screen" role="status" aria-live="polite" aria-label="Memuat profil">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Skeleton className="mx-auto h-7 w-40 rounded-full border border-primary/20 bg-primary/10" />
          <Skeleton className="mx-auto mt-4 h-10 w-64 rounded-sm bg-primary/10" />
          <Skeleton className="mx-auto mt-3 h-4 w-96 max-w-full rounded-sm bg-secondary/50" />
        </div>

        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-lg bg-primary/10" />
                <Skeleton className="h-6 w-40 rounded-sm bg-primary/10" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-sm bg-secondary/50" />
                <Skeleton className="h-4 w-5/6 rounded-sm bg-secondary/50" />
                <Skeleton className="h-4 w-4/6 rounded-sm bg-secondary/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
