"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  threshold?: number;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

const DIRECTION_CLASSES = {
  up: "translate-y-8",
  down: "-translate-y-8",
  left: "translate-x-8",
  right: "-translate-x-8",
  none: "",
} as const;

export function ScrollReveal({
  children,
  className,
  threshold = 0.1,
  delay = 0,
  direction = "up",
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) {
            el.style.transitionDelay = `${delay}ms`;
          }
          el.classList.add("sr-visible");
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay]);

  return (
    <div
      ref={ref}
      className={cn(
        "sr-reveal",
        DIRECTION_CLASSES[direction],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
