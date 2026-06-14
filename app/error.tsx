"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowPath, ExclamationTriangle, Home } from "@/lib/icons";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report error to server-side logger
    fetch("/api/report-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: "error",
        module: "error-boundary",
        message: error.message || "Route error",
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
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden dark">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.03)_0%,transparent_70%)]" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-destructive/5 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 text-center px-4 max-w-lg">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center">
          <ExclamationTriangle className="w-10 h-10 text-destructive" />
        </div>

        <h1 className="font-orbitron text-2xl md:text-3xl font-bold text-foreground mb-3">
          SYSTEM_ERROR
        </h1>
        <p className="font-mono text-sm text-muted-foreground mb-2">
          Terjadi kesalahan yang tidak terduga pada sistem.
        </p>

        {/* Error details */}
        <div className="my-6 border border-destructive/20 bg-destructive/5 p-4 text-left font-mono text-xs max-w-sm mx-auto">
          <div className="text-destructive/80 mb-1 font-bold">ERROR_LOG:</div>
          <div className="text-muted-foreground break-all">
            {error.message || "Unknown error occurred"}
          </div>
          {error.digest && (
            <div className="text-muted-foreground/50 mt-2 text-[10px]">
              DIGEST: {error.digest}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="font-mono bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <ArrowPath className="mr-2 h-4 w-4" /> RETRY_SEQUENCE
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="font-mono border-destructive/50 hover:bg-destructive/10"
          >
            <ArrowPath className="mr-2 h-4 w-4" /> RELOAD_PAGE
          </Button>
          <Link href="/" prefetch={false}>
            <Button
              variant="outline"
              className="font-mono border-primary/50 hover:bg-primary/10"
            >
              <Home className="mr-2 h-4 w-4" /> HOME_BASE
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
