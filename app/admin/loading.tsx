export default function AdminLoading() {
  return (
    <div className="flex min-h-[calc(100dvh-9rem)] w-full items-center justify-center px-4 py-10">
      <div className="relative flex flex-col items-center text-center font-mono">
        <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex h-20 w-20 items-center justify-center border border-primary/30 bg-background/80 shadow-[0_0_45px_hsl(var(--primary)/0.18)] backdrop-blur-xl">
          <div className="absolute inset-2 border border-primary/15" />
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.35em] text-primary/80">
          LOADING_ADMIN_PANEL
        </p>
        <p className="mt-2 max-w-sm text-xs leading-6 text-muted-foreground">
          Synchronizing secure admin route, server data, and interface state...
        </p>

        <div className="mt-6 flex items-center gap-2">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
              style={{ animationDelay: `${index * 120}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
