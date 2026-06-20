export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-[100dvh] items-center justify-center bg-background text-foreground">
      <div className="relative flex flex-col items-center gap-5 px-6 text-center">
        <div className="pointer-events-none absolute inset-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative grid h-16 w-16 place-items-center">
          <div className="absolute inset-0 rounded-full border border-primary/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-r-accent border-t-primary" />
          <div className="absolute inset-3 rounded-full border border-primary/30 bg-primary/10" />
          <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_18px_hsl(var(--primary))]" />
        </div>
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary/90">
            Loading IRNK
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Initializing interface
          </p>
        </div>
      </div>
    </div>
  );
}
