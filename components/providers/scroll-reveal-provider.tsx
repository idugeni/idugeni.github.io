"use client";

import { useEffect } from "react";

/**
 * Global scroll-reveal provider — single IntersectionObserver watches all .sr-reveal elements.
 * Replaces per-instance ScrollReveal components, eliminating client boundaries from 20+ sections.
 */
export function ScrollRevealProvider() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".sr-reveal");
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("sr-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
