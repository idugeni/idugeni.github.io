export function AdminRuntimeFallback({ label = "LOADING_ADMIN_ROUTE" }: { label?: string }) {
  return (
    <div className="flex min-h-[420px] items-center justify-center border border-primary/20 bg-card/60">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">{label}</p>
        <p className="max-w-sm font-mono text-[11px] text-muted-foreground">
          Establishing request-bound admin session context...
        </p>
      </div>
    </div>
  );
}
