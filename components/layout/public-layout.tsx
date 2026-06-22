import type { ReactNode } from "react";
import { Suspense } from "react";
import { headers } from "next/headers";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { Breadcrumbs } from "./breadcrumbs";
import { PublicLayoutClient } from "./public-layout-client";

function PublicChromeFallback() {
  return null;
}

async function BreadcrumbsWrapper() {
  const hdrs = await headers();
  const forwardedUrl = hdrs.get("x-forwarded-url");
  let pathname = "/";
  if (forwardedUrl) {
    try {
      pathname = new URL(forwardedUrl, "http://localhost").pathname;
    } catch {
      pathname = forwardedUrl.startsWith("/") ? forwardedUrl : "/";
    }
  }
  return <Breadcrumbs pathname={pathname} />;
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col relative dark overflow-x-hidden w-full max-w-[100vw] overflow-guard">
      <div className="w-full overflow-x-hidden flex flex-col min-h-[100dvh]">
        <Suspense fallback={<PublicChromeFallback />}>
          <Navbar />
        </Suspense>
        <Suspense fallback={<PublicChromeFallback />}>
          <BreadcrumbsWrapper />
        </Suspense>
        <main className="flex-1 z-10 overflow-x-hidden">{children}</main>
        <Footer />
        <Suspense fallback={<PublicChromeFallback />}>
          <PublicLayoutClient />
        </Suspense>
      </div>
    </div>
  );
}
