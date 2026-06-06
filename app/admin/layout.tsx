import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin — IRNK Codes",
    default: "Dashboard | Admin — IRNK Codes",
  },
  robots: {
    index: false,
    follow: false,
  },
};

function AdminRouteFallback() {
  return (
    <div className="dark flex min-h-[100dvh] items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-3xl space-y-6 border border-primary/20 bg-card/70 p-8 text-center shadow-[0_0_80px_rgba(0,255,255,0.08)]">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <div className="space-y-2 font-mono">
          <p className="text-xs uppercase tracking-[0.28em] text-primary">ADMIN SESSION PREPARATION</p>
          <p className="mx-auto max-w-lg text-[11px] leading-relaxed text-muted-foreground">
            Preparing the protected admin workspace with a fresh request-bound session. Refresh if the
            dashboard does not appear shortly.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3" aria-hidden="true">
          <div className="h-28 animate-pulse border border-border/60 bg-secondary/40" />
          <div className="h-28 animate-pulse border border-border/60 bg-secondary/40 delay-75" />
          <div className="h-28 animate-pulse border border-border/60 bg-secondary/40 delay-150" />
        </div>
      </div>
    </div>
  );
}

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<AdminRouteFallback />}>
      <AdminLayout>{children}</AdminLayout>
    </Suspense>
  );
}
