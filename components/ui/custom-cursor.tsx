"use client";
import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const [isDesktop, setIsDesktop] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const isPointer = useRef(false);
  const rafId = useRef<number>(0);
  const mounted = useRef(false);

  useEffect(() => {
    // Only enable on desktop (fine pointer = mouse, not touch)
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setIsDesktop(true);
    mounted.current = true;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX - 4}px, ${e.clientY - 4}px, 0) scale(${isPointer.current ? 1.5 : 1})`;
      }

      // Check cursor type — use tag/role checks only (no getComputedStyle)
      const target = e.target as HTMLElement;
      if (target) {
        const tagName = target.tagName.toLowerCase();
        isPointer.current =
          tagName === "a" ||
          tagName === "button" ||
          target.closest("a") !== null ||
          target.closest("button") !== null ||
          target.getAttribute("role") === "button";
      }
    };

    const animate = () => {
      if (!mounted.current) return;

      const ease = 0.15;
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x - 16}px, ${ringPos.current.y - 16}px, 0) scale(${isPointer.current ? 0.5 : 1})`;
        ringRef.current.style.backgroundColor = isPointer.current
          ? "rgba(6, 182, 212, 0.1)"
          : "transparent";
      }

      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafId.current = requestAnimationFrame(animate);

    return () => {
      mounted.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  if (!isDesktop) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-[9999] mix-blend-screen shadow-[0_0_8px_rgba(6,182,212,0.8)]"
        style={{ willChange: "transform" }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 border border-primary/50 rounded-full pointer-events-none z-[9998]"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
