"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BackToTop } from "@/components/ui/back-to-top";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { LoadingScreen } from "@/components/ui/loading-screen";

function trackPageView(pathname: string) {
  if (typeof window === "undefined") return;

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") {
    return;
  }

  const payload = JSON.stringify({
    halaman: pathname,
    referrer: document.referrer || null,
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/page-view", blob);
    return;
  }

  void fetch("/api/page-view", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  });
}

export function PublicLayoutClient() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    trackPageView(pathname);
  }, [pathname]);

  return (
    <>
      <LoadingScreen />
      <CustomCursor />
      <BackToTop />
    </>
  );
}
