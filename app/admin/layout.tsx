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

function AdminShellFallback() {
  return (
    <div className="dark flex min-h-[100dvh] items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-3 font-mono">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <p className="text-xs uppercase tracking-[0.28em] text-primary/70">LOADING</p>
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
    <Suspense fallback={<AdminShellFallback />}>
      <AdminLayout>{children}</AdminLayout>
    </Suspense>
  );
}
