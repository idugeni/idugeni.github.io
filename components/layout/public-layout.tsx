import type { ReactNode } from "react";
import { Suspense } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { Breadcrumbs } from "./breadcrumbs";
import { PublicLayoutClient } from "./public-layout-client";
import { PublicNavigationTransition } from "./public-navigation-transition";

function PublicChromeFallback() {
  return null;
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col relative dark overflow-x-hidden w-full max-w-[100vw]">
      <Suspense fallback={<PublicChromeFallback />}>
        <Navbar />
      </Suspense>
      <Suspense fallback={<PublicChromeFallback />}>
        <Breadcrumbs />
      </Suspense>
      <main className="flex-1 z-10">{children}</main>
      <Footer />
      <Suspense fallback={<PublicChromeFallback />}>
        <PublicNavigationTransition />
      </Suspense>
      <Suspense fallback={<PublicChromeFallback />}>
        <PublicLayoutClient />
      </Suspense>
    </div>
  );
}
