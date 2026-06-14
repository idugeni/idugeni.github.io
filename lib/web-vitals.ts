/**
 * Web Vitals Reporter for IRNK Codes
 *
 * Captures Core Web Vitals using native PerformanceObserver API
 * and reports to Vercel Analytics as custom events.
 *
 * Metrics tracked:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * - INP (Interaction to Next Paint)
 */

import { track } from "@vercel/analytics";

// Experimental Performance API types not in standard TypeScript lib
interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  cancelable: boolean;
  duration: number;
}

interface PerformancePaintTiming extends PerformanceEntry {
  name: string;
}

type MetricName = "LCP" | "FID" | "CLS" | "FCP" | "TTFB" | "INP";

interface MetricEntry {
  name: MetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
}

function getRating(name: MetricName, value: number): "good" | "needs-improvement" | "poor" {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  };

  const t = thresholds[name];
  if (value <= t.good) return "good";
  if (value <= t.poor) return "needs-improvement";
  return "poor";
}

function reportMetric(entry: MetricEntry): void {
  track(`web-vital-${entry.name.toLowerCase()}`, {
    value: Math.round(entry.value),
    rating: entry.rating,
  });
}

// LCP - Largest Contentful Paint
function observeLCP(): void {
  if (typeof PerformanceObserver === "undefined") return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;
      if (lastEntry) {
        const metric: MetricEntry = {
          name: "LCP",
          value: lastEntry.startTime,
          rating: getRating("LCP", lastEntry.startTime),
        };
        reportMetric(metric);
      }
    });
    observer.observe({ type: "largest-contentful-paint", buffered: true });
  } catch (e) {
    // Silently fail if not supported
  }
}

// FID - First Input Delay
function observeFID(): void {
  if (typeof PerformanceObserver === "undefined") return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEventTiming[]) {
        const fid = entry.processingStart - entry.startTime;
        const metric: MetricEntry = {
          name: "FID",
          value: fid,
          rating: getRating("FID", fid),
        };
        reportMetric(metric);
      }
    });
    observer.observe({ type: "first-input", buffered: true });
  } catch (e) {
    // Silently fail if not supported
  }
}

// CLS - Cumulative Layout Shift
function observeCLS(): void {
  if (typeof PerformanceObserver === "undefined") return;

  let clsValue = 0;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShiftEntry[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
    });
    observer.observe({ type: "layout-shift", buffered: true });

    // Report CLS when page is hidden or unloaded
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        const metric: MetricEntry = {
          name: "CLS",
          value: clsValue,
          rating: getRating("CLS", clsValue),
        };
        reportMetric(metric);
      }
    });
  } catch (e) {
    // Silently fail if not supported
  }
}

// FCP - First Contentful Paint
function observeFCP(): void {
  if (typeof PerformanceObserver === "undefined") return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformancePaintTiming[]) {
        if (entry.name === "first-contentful-paint") {
          const metric: MetricEntry = {
            name: "FCP",
            value: entry.startTime,
            rating: getRating("FCP", entry.startTime),
          };
          reportMetric(metric);
          observer.disconnect();
        }
      }
    });
    observer.observe({ type: "paint", buffered: true });
  } catch (e) {
    // Silently fail if not supported
  }
}

// TTFB - Time to First Byte
function observeTTFB(): void {
  try {
    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      const metric: MetricEntry = {
        name: "TTFB",
        value: ttfb,
        rating: getRating("TTFB", ttfb),
      };
      reportMetric(metric);
    }
  } catch (e) {
    // Silently fail if not supported
  }
}

// INP - Interaction to Next Paint
function observeINP(): void {
  if (typeof PerformanceObserver === "undefined") return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEventTiming[]) {
        const inp = entry.duration;
        const metric: MetricEntry = {
          name: "INP",
          value: inp,
          rating: getRating("INP", inp),
        };
        reportMetric(metric);
      }
    });
    observer.observe({ type: "event", buffered: true });
  } catch (e) {
    // Silently fail if not supported
  }
}

/**
 * Initialize web vitals reporting.
 * Call this in app/layout.tsx on the client side.
 */
export function initWebVitals(): void {
  if (typeof window === "undefined") return;

  // Wait for DOM to be ready
  if (document.readyState === "complete") {
    observeAll();
  } else {
    window.addEventListener("load", observeAll);
  }
}

function observeAll(): void {
  observeLCP();
  observeFID();
  observeCLS();
  observeFCP();
  observeTTFB();
  observeINP();
}
