"use client";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("irnk_loaded");
    if (hasVisited === "1") return;

    // Show loading screen only after a short delay (CSS animation kicks in)
    const t = setTimeout(() => setShow(true), 50);

    const hide = setTimeout(() => {
      sessionStorage.setItem("irnk_loaded", "1");
      setShow(false);
    }, 1200);

    return () => {
      clearTimeout(t);
      clearTimeout(hide);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-background flex flex-col items-center justify-center pointer-events-none animate-fade-in-up">
      <div className="relative mb-8">
        <div className="text-5xl md:text-6xl font-orbitron font-bold text-primary tracking-wider select-none">
          IRNK
        </div>
      </div>
      <div className="w-48 md:w-64">
        <div className="h-[2px] bg-border/30 w-full overflow-hidden">
          <div
            className="h-full bg-primary shadow-[0_0_8px_rgba(6,182,212,0.6)]"
            style={{ animation: "loading-progress 1s ease-out forwards" }}
          />
        </div>
      </div>
    </div>
  );
}
