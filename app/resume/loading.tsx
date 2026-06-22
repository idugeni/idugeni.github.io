import { Skeleton } from "@/components/ui/skeleton";

export default function ResumeLoading() {
  return (
    <div className="pt-4 pb-20 min-h-screen" role="status" aria-live="polite" aria-label="Memuat resume">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Skeleton className="mx-auto h-7 w-36 rounded-full border border-primary/20 bg-primary/10" />
          <Skeleton className="mx-auto mt-4 h-10 w-56 rounded-sm bg-primary/10" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6">
              <Skeleton className="h-5 w-48 rounded-sm bg-primary/10 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-sm bg-secondary/50" />
                <Skeleton className="h-4 w-4/5 rounded-sm bg-secondary/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
