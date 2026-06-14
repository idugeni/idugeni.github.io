export default function BlogDetailLoading() {
  return (
    <div className="min-h-screen pb-16 pt-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
          <span className="text-muted-foreground/40">/</span>
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <span className="text-muted-foreground/40">/</span>
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        </div>

        {/* Title skeleton */}
        <div className="mb-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-8 w-1/2 animate-pulse rounded bg-muted" />
        </div>

        {/* Meta skeleton */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        </div>

        {/* Thumbnail skeleton */}
        <div className="mb-8 aspect-video w-full animate-pulse rounded-lg bg-muted" />

        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
