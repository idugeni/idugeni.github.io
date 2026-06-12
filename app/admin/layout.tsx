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

function AdminShellSkeleton() {
  return (
    <div className="dark flex min-h-[100dvh] bg-background text-foreground">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.13),transparent_30%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.10),transparent_28%)]" />
      <div className="flex min-h-[100dvh]">
        <aside className="hidden md:flex w-80 h-[100dvh] flex-col border-r border-primary/15 bg-background/60">
          <div className="p-6 border-b border-border/30">
            <div className="h-7 w-24 bg-primary/10 animate-pulse" />
            <div className="h-3 w-40 bg-primary/5 animate-pulse mt-2" />
          </div>
          <div className="flex-1 p-4 space-y-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-12 bg-primary/5 animate-pulse rounded" />
            ))}
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0 md:pl-[320px]">
          <header className="sticky top-0 z-30 h-20 border-b border-primary/10 bg-background/60 animate-pulse" />
          <main className="flex-1 p-8">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-primary/5 animate-pulse rounded" />
              ))}
            </div>
          </main>
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
    <Suspense fallback={<AdminShellSkeleton />}>
      <AdminLayout>{children}</AdminLayout>
    </Suspense>
  );
}
