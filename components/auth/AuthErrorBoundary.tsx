"use client";

import { Button } from "@/components/ui/button";
import { ArrowPath, Home, Lock } from "@/lib/icons";
import Link from "next/link";

export function AuthErrorBoundary({
  reset,
  title,
  description,
}: {
  reset: () => void;
  title: string;
  description: string;
}) {
  return (
    <main className="dark flex min-h-screen items-center justify-center bg-background px-4 py-16 text-foreground">
      <section className="w-full max-w-md border border-destructive/25 bg-card/85 p-8 text-center shadow-[0_0_80px_rgba(239,68,68,0.08)]">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-destructive/30 bg-destructive/10">
          <Lock className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="font-orbitron text-xl font-bold uppercase tracking-wider text-foreground">{title}</h1>
        <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={reset} className="rounded-none font-mono">
            <ArrowPath className="mr-2 h-4 w-4" /> RETRY_AUTH
          </Button>
          <Button asChild variant="outline" className="rounded-none font-mono">
            <Link href="/" prefetch={false}>
              <Home className="mr-2 h-4 w-4" /> HOME_BASE
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
