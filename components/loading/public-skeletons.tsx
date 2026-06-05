type PublicIndexSkeletonProps = {
  titleWidth?: string;
  subtitleWidth?: string;
  filters?: number;
  cards?: number;
  columns?: "two" | "three";
  variant?: "cards" | "articles" | "gallery";
};

type PublicDetailSkeletonProps = {
  media?: boolean;
  sidebar?: boolean;
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md border border-primary/10 bg-gradient-to-br from-primary/10 via-secondary/40 to-background/80 shadow-[0_0_32px_rgba(0,229,255,0.04)] ${className}`}
      aria-hidden="true"
    />
  );
}

function LoadingSignal({ label = "Preparing interface" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 font-mono text-[11px] uppercase tracking-[0.28em] text-primary/80">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
      <span className="ml-2">{label}</span>
    </div>
  );
}

export function PublicPageSkeleton({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,229,255,0.12),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(139,92,246,0.10),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.20),transparent)]" />
      <div className="container relative mx-auto px-4 py-12">
        {children}
        <LoadingSignal label={label} />
      </div>
    </main>
  );
}

export function PublicHomeSkeleton() {
  return (
    <PublicPageSkeleton label="Loading homepage">
      <section className="mx-auto grid min-h-[70vh] max-w-6xl items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <SkeletonBlock className="h-5 w-40 rounded-full" />
          <SkeletonBlock className="h-16 w-full max-w-3xl" />
          <SkeletonBlock className="h-16 w-5/6 max-w-2xl" />
          <div className="space-y-3 pt-2">
            <SkeletonBlock className="h-4 w-full max-w-xl" />
            <SkeletonBlock className="h-4 w-4/5 max-w-lg" />
          </div>
          <div className="flex flex-wrap gap-3 pt-4">
            <SkeletonBlock className="h-11 w-36" />
            <SkeletonBlock className="h-11 w-40" />
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border border-primary/15 bg-card/40 p-5 shadow-[0_0_80px_rgba(0,229,255,0.08)]">
          <SkeletonBlock className="h-72 w-full rounded-xl" />
          <div className="grid grid-cols-3 gap-3">
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <SkeletonBlock key={item} className="h-44 rounded-xl" />
        ))}
      </section>
    </PublicPageSkeleton>
  );
}

export function PublicIndexSkeleton({
  titleWidth = "w-56",
  subtitleWidth = "max-w-2xl",
  filters = 4,
  cards = 6,
  columns = "three",
  variant = "cards",
}: PublicIndexSkeletonProps) {
  const gridClass = columns === "two" ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <PublicPageSkeleton label="Loading content">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-4">
          <SkeletonBlock className={`h-11 ${titleWidth}`} />
          <SkeletonBlock className={`h-5 w-full ${subtitleWidth}`} />
        </header>

        <div className="flex flex-wrap gap-3">
          {Array.from({ length: filters }, (_, index) => (
            <SkeletonBlock key={index} className="h-10 w-28 rounded-full" />
          ))}
        </div>

        <div className={`grid grid-cols-1 gap-6 ${gridClass}`}>
          {Array.from({ length: cards }, (_, index) => (
            <article key={index} className="overflow-hidden rounded-2xl border border-primary/10 bg-card/50 p-4 shadow-[0_0_40px_rgba(0,229,255,0.04)]">
              {variant !== "articles" && <SkeletonBlock className="mb-5 h-44 w-full rounded-xl" />}
              {variant === "gallery" ? (
                <div className="space-y-3">
                  <SkeletonBlock className="h-4 w-2/3" />
                  <SkeletonBlock className="h-3 w-1/2" />
                </div>
              ) : (
                <div className="space-y-3">
                  <SkeletonBlock className="h-6 w-3/4" />
                  <SkeletonBlock className="h-4 w-full" />
                  <SkeletonBlock className="h-4 w-5/6" />
                  <div className="flex gap-2 pt-2">
                    <SkeletonBlock className="h-7 w-16 rounded-full" />
                    <SkeletonBlock className="h-7 w-20 rounded-full" />
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </PublicPageSkeleton>
  );
}

export function PublicDetailSkeleton({ media = true, sidebar = true }: PublicDetailSkeletonProps) {
  return (
    <PublicPageSkeleton label="Loading detail">
      <article className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <header className="space-y-5">
            <SkeletonBlock className="h-5 w-36 rounded-full" />
            <SkeletonBlock className="h-12 w-full max-w-4xl" />
            <SkeletonBlock className="h-12 w-3/4 max-w-3xl" />
            <div className="flex flex-wrap gap-3">
              <SkeletonBlock className="h-8 w-24 rounded-full" />
              <SkeletonBlock className="h-8 w-28 rounded-full" />
              <SkeletonBlock className="h-8 w-20 rounded-full" />
            </div>
          </header>

          {media && <SkeletonBlock className="h-[22rem] w-full rounded-2xl" />}

          <div className="space-y-4 rounded-2xl border border-primary/10 bg-card/40 p-6">
            {Array.from({ length: 9 }, (_, index) => (
              <SkeletonBlock
                key={index}
                className={`h-4 ${index % 4 === 0 ? "w-11/12" : index % 3 === 0 ? "w-4/5" : "w-full"}`}
              />
            ))}
          </div>
        </div>

        {sidebar && (
          <aside className="space-y-5">
            <SkeletonBlock className="h-40 rounded-2xl" />
            <SkeletonBlock className="h-56 rounded-2xl" />
            <SkeletonBlock className="h-32 rounded-2xl" />
          </aside>
        )}
      </article>
    </PublicPageSkeleton>
  );
}

export function PublicSimplePageSkeleton({ label = "Loading page" }: { label?: string }) {
  return (
    <PublicPageSkeleton label={label}>
      <section className="mx-auto max-w-5xl space-y-8 py-10">
        <header className="space-y-4 text-center">
          <SkeletonBlock className="mx-auto h-5 w-32 rounded-full" />
          <SkeletonBlock className="mx-auto h-12 w-full max-w-2xl" />
          <SkeletonBlock className="mx-auto h-5 w-full max-w-xl" />
        </header>
        <div className="grid gap-5 md:grid-cols-3">
          <SkeletonBlock className="h-40 rounded-2xl" />
          <SkeletonBlock className="h-40 rounded-2xl" />
          <SkeletonBlock className="h-40 rounded-2xl" />
        </div>
        <div className="space-y-4 rounded-2xl border border-primary/10 bg-card/40 p-6">
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonBlock key={index} className={`h-4 ${index % 2 === 0 ? "w-full" : "w-5/6"}`} />
          ))}
        </div>
      </section>
    </PublicPageSkeleton>
  );
}

export function PublicLegalSkeleton({ label = "Loading document" }: { label?: string }) {
  return (
    <PublicPageSkeleton label={label}>
      <article className="mx-auto max-w-3xl space-y-8 py-10">
        <header className="space-y-4">
          <SkeletonBlock className="h-5 w-28 rounded-full" />
          <SkeletonBlock className="h-11 w-2/3" />
          <SkeletonBlock className="h-4 w-1/2" />
        </header>
        {Array.from({ length: 4 }, (_, section) => (
          <section key={section} className="space-y-3 rounded-2xl border border-primary/10 bg-card/35 p-5">
            <SkeletonBlock className="h-6 w-48" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-11/12" />
            <SkeletonBlock className="h-4 w-4/5" />
          </section>
        ))}
      </article>
    </PublicPageSkeleton>
  );
}

export function PublicFormSkeleton({ label = "Loading secure form" }: { label?: string }) {
  return (
    <PublicPageSkeleton label={label}>
      <section className="mx-auto flex min-h-[65vh] max-w-md items-center justify-center py-10">
        <div className="w-full space-y-6 rounded-2xl border border-primary/20 bg-card/70 p-8 shadow-[0_0_80px_rgba(0,229,255,0.08)]">
          <SkeletonBlock className="mx-auto h-12 w-12 rounded-full" />
          <div className="space-y-3 text-center">
            <SkeletonBlock className="mx-auto h-8 w-56" />
            <SkeletonBlock className="mx-auto h-4 w-44" />
          </div>
          <div className="space-y-4">
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
          </div>
        </div>
      </section>
    </PublicPageSkeleton>
  );
}

export function PublicRedirectSkeleton({ label = "Resolving destination" }: { label?: string }) {
  return (
    <PublicPageSkeleton label={label}>
      <section className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center py-10 text-center">
        <div className="w-full space-y-6 rounded-2xl border border-primary/20 bg-card/70 p-8 shadow-[0_0_80px_rgba(0,229,255,0.08)]">
          <SkeletonBlock className="mx-auto h-16 w-16 rounded-full" />
          <SkeletonBlock className="mx-auto h-8 w-64" />
          <SkeletonBlock className="mx-auto h-4 w-full max-w-sm" />
          <SkeletonBlock className="mx-auto h-10 w-40" />
        </div>
      </section>
    </PublicPageSkeleton>
  );
}

export function PublicNavigationSkeletonOverlay() {
  return (
    <div
      className="fixed inset-0 z-[60] overflow-hidden bg-background/92 text-foreground backdrop-blur-xl"
      role="status"
      aria-live="polite"
      aria-label="Loading next page"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,229,255,0.16),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(139,92,246,0.14),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.15),transparent)]" />
      <div className="container relative mx-auto flex min-h-screen items-center px-4 py-20">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <div className="space-y-4 text-center">
            <SkeletonBlock className="mx-auto h-5 w-36 rounded-full" />
            <SkeletonBlock className="mx-auto h-12 w-full max-w-2xl" />
            <SkeletonBlock className="mx-auto h-4 w-full max-w-xl" />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <SkeletonBlock className="h-44 rounded-2xl" />
            <SkeletonBlock className="h-44 rounded-2xl" />
            <SkeletonBlock className="h-44 rounded-2xl" />
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 font-mono text-[11px] uppercase tracking-[0.28em] text-primary/80">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
            <span className="ml-2">Loading interface</span>
          </div>
        </div>
      </div>
    </div>
  );
}
