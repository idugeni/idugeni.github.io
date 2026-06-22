import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryLoading() {
  return (
    <div className="pt-4 pb-20 min-h-screen" role="status" aria-live="polite" aria-label="Memuat galeri">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Skeleton className="mx-auto h-7 w-36 rounded-full border border-primary/20 bg-primary/10" />
          <Skeleton className="mx-auto mt-4 h-10 w-64 rounded-sm bg-primary/10" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          <Skeleton className="col-span-2 row-span-2 h-80 rounded-sm bg-secondary/60" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-sm bg-secondary/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
