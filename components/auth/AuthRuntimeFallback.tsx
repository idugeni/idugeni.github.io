type AuthRuntimeFallbackProps = {
  title: string;
  description: string;
};

export function AuthRuntimeFallback({ title, description }: AuthRuntimeFallbackProps) {
  return (
    <main className="dark flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16 text-foreground">
      <section className="relative w-full max-w-md border border-primary/25 bg-card/80 p-8 shadow-[0_0_80px_rgba(0,255,255,0.08)] backdrop-blur">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="mb-8 space-y-3">
          <div className="h-2 w-24 animate-pulse rounded-full bg-primary/50" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-primary/10" />
          <div className="h-4 w-full animate-pulse rounded bg-muted/40" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted/40" />
        </div>
        <div className="space-y-3 font-mono">
          <p className="text-xs uppercase tracking-[0.28em] text-primary">{title}</p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </section>
    </main>
  );
}
