type AuthRuntimeFallbackProps = {
  title: string;
  description: string;
};

export function AuthRuntimeFallback({ title, description }: AuthRuntimeFallbackProps) {
  return (
    <main className="dark flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16 text-foreground">
      <section
        className="relative w-full max-w-md overflow-hidden border border-primary/25 bg-card/85 p-8 shadow-[0_0_80px_rgba(0,255,255,0.08)] backdrop-blur"
        role="status"
        aria-live="polite"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-sm font-bold text-primary">
            SEC
          </div>
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">{title}</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="rounded-sm border border-border/40 bg-background/40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Menyiapkan konteks aman...
        </div>
      </section>
    </main>
  );
}
