import type { ReactNode } from "react";
import { Suspense } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { Breadcrumbs } from "./breadcrumbs";
import { PublicLayoutClient } from "./public-layout-client";

function PublicChromeFallback() {
  return null;
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col relative dark">
      <Suspense fallback={<PublicChromeFallback />}>
        <Navbar />
      </Suspense>
      <Suspense fallback={<PublicChromeFallback />}>
        <Breadcrumbs />
      </Suspense>
      <main className="flex-1 z-10">{children}</main>
      <Footer />
      <Suspense fallback={<PublicChromeFallback />}>
        <PublicLayoutClient />
      </Suspense>
    </div>
  );
}
