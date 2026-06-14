"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    fetch("/api/report-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: "fatal",
        module: "global-error",
        message: error.message || "Critical system failure",
        error: error.message,
        stack: error.stack,
        metadata: {
          digest: error.digest,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        },
      }),
    }).catch(() => {
      /* swallow — don't create error loops */
    });
  }, [error]);
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-background text-foreground">
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.05)_0%,transparent_70%)]" />

          <div className="relative z-10 text-center px-4 max-w-lg">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="font-bold text-2xl mb-3">CRITICAL_SYSTEM_FAILURE</h1>
            <p className="text-sm text-gray-400 font-mono mb-4">
              Aplikasi mengalami error fatal. Silakan coba lagi.
            </p>
            <div className="my-4 border border-red-500/20 bg-red-500/5 p-3 text-left font-mono text-xs text-gray-400 max-w-sm mx-auto">
              {process.env.NODE_ENV === "development" ? (error.message || "Unhandled application error") : "An unexpected error occurred. Please try again."}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="font-mono px-6 py-3 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
              >
                REBOOT_SYSTEM
              </button>
              <button
                onClick={() => window.location.reload()}
                className="font-mono px-6 py-3 border border-red-500/40 text-red-200 hover:bg-red-500/10 transition-colors"
              >
                RELOAD_PAGE
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
