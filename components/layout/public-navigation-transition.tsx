"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PublicNavigationSkeletonOverlay } from "@/components/loading/public-skeletons";

const MIN_VISIBLE_MS = 260;
const SAFETY_TIMEOUT_MS = 1_500;

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function findAnchor(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest<HTMLAnchorElement>("a[href]");
}

function shouldShowTransition(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");

  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  if (anchor.target && anchor.target !== "_self") {
    return false;
  }

  if (anchor.hasAttribute("download")) {
    return false;
  }

  const nextUrl = new URL(anchor.href, window.location.href);
  const currentUrl = new URL(window.location.href);

  if (nextUrl.origin !== currentUrl.origin) {
    return false;
  }

  if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) {
    return false;
  }

  return nextUrl.pathname.startsWith("/");
}

export function PublicNavigationTransition() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const startedAtRef = useRef(0);
  const safetyTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function clearTimers() {
      if (safetyTimeoutRef.current) {
        window.clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }

      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    }

    function showTransition() {
      clearTimers();
      startedAtRef.current = window.performance.now();
      setIsNavigating(true);
      safetyTimeoutRef.current = window.setTimeout(() => {
        setIsNavigating(false);
      }, SAFETY_TIMEOUT_MS);
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || isModifiedClick(event)) {
        return;
      }

      const anchor = findAnchor(event.target);

      if (!anchor || !shouldShowTransition(anchor)) {
        return;
      }

      showTransition();
    }

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (!isNavigating) {
      return;
    }

    const elapsed = window.performance.now() - startedAtRef.current;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);

    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      setIsNavigating(false);
    }, remaining);
  }, [isNavigating, pathname, searchParams]);

  if (!isNavigating) {
    return null;
  }

  return <PublicNavigationSkeletonOverlay />;
}
