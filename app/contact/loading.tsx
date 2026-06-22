import { Skeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
  return (
    <div className="pt-4 pb-20 min-h-screen" role="status" aria-live="polite" aria-label="Memuat kontak">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Skeleton className="mx-auto h-7 w-40 rounded-full border border-primary/20 bg-primary/10" />
          <Skeleton className="mx-auto mt-4 h-10 w-72 rounded-sm bg-primary/10" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-12 w-full rounded-sm bg-secondary/60" />
            <Skeleton className="h-12 w-full rounded-sm bg-secondary/60" />
            <Skeleton className="h-32 w-full rounded-sm bg-secondary/60" />
            <Skeleton className="h-12 w-48 rounded-sm bg-primary/10" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-border/50 bg-card/80 p-6 space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="w-10 h-10 rounded bg-primary/10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24 rounded-sm bg-secondary/50" />
                    <Skeleton className="h-4 w-40 rounded-sm bg-secondary/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
