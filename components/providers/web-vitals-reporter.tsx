"use client";

import { useEffect } from "react";
import { initWebVitals } from "@/lib/web-vitals";

/**
 * Client component that initializes web vitals reporting on mount.
 * Place this once in app/layout.tsx.
 */
export function WebVitalsReporter() {
  useEffect(() => {
    initWebVitals();
  }, []);

  return null;
}
