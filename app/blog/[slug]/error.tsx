"use client";

import { useEffect } from "react";

export default function BlogDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[blog-detail] Error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
          <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">Gagal Memuat Artikel</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Terjadi kesalahan saat memuat artikel ini. Server mungkin sedang mengalami gangguan sementara.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Coba Lagi
          </button>
          <a href="/blog" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            Kembali ke Blog
          </a>
        </div>
        {error.digest && (
          <p className="mt-4 font-mono text-xs text-muted-foreground/50">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
