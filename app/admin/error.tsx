"use client";

import { Button } from "@/components/ui/button";
import { ArrowPath, Home, Shield } from "@/lib/icons";
import Link from "next/link";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="dark flex min-h-[100dvh] items-center justify-center bg-background p-6 text-foreground">
      <section className="w-full max-w-xl border border-destructive/25 bg-card/80 p-8 text-center shadow-[0_0_80px_rgba(239,68,68,0.08)]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-destructive/30 bg-destructive/10">
          <Shield className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="font-orbitron text-2xl font-bold uppercase tracking-wider text-foreground">
          ADMIN_CONTEXT_INTERRUPTED
        </h1>
        <p className="mx-auto mt-3 max-w-md font-mono text-xs leading-relaxed text-muted-foreground">
          The protected admin workspace lost its runtime context. Retry the route or return to the dashboard
          after confirming your session is still valid.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} className="rounded-none font-mono">
            <ArrowPath className="mr-2 h-4 w-4" /> RETRY_ADMIN
          </Button>
          <Button asChild variant="outline" className="rounded-none font-mono">
            <Link href="/admin" prefetch={false}>
              <Home className="mr-2 h-4 w-4" /> ADMIN_HOME
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
