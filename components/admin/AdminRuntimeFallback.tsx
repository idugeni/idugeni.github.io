export function AdminRuntimeFallback({ label = "ADMIN ROUTE PREPARATION" }: { label?: string }) {
  return (
    <div className="flex min-h-[420px] items-center justify-center border border-primary/20 bg-card/60 p-6">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <div className="space-y-2 font-mono">
          <p className="text-xs uppercase tracking-[0.28em] text-primary">{label}</p>
          <p className="mx-auto max-w-md text-[11px] leading-relaxed text-muted-foreground">
            Establishing a secure request-bound admin context. If this panel does not hydrate shortly,
            refresh after confirming your session is still valid.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3" aria-hidden="true">
          <div className="h-24 animate-pulse border border-border/50 bg-secondary/40" />
          <div className="h-24 animate-pulse border border-border/50 bg-secondary/40 delay-75" />
          <div className="h-24 animate-pulse border border-border/50 bg-secondary/40 delay-150" />
        </div>
      </div>
    </div>
  );
}
