"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<"loading" | "fadeout" | "done">("loading");
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Check if we've already shown the loading screen in this session
    const hasVisited = sessionStorage.getItem("irnk_loaded");

    // If we've already loaded and just navigating, don't show the full boot screen
    if (hasVisited === "1") {
      setIsVisible(false);
      setPhase("done");
      return;
    }

    const duration = 1500;
    const interval = 30;
    let elapsed = 0;
    let fadeTimer: NodeJS.Timeout;

    const timer = setInterval(() => {
      elapsed += interval;
      const t = elapsed / duration;
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setProgress(Math.min(100, Math.floor(eased * 100)));

      if (elapsed >= duration) {
        clearInterval(timer);
        setPhase("fadeout");
        sessionStorage.setItem("irnk_loaded", "1");

        // Use a standard timeout for fadeout animation
        fadeTimer = setTimeout(() => {
          setPhase("done");
          setIsVisible(false);
        }, 300);
      }
    }, interval);

    return () => {
      clearInterval(timer);
      clearTimeout(fadeTimer);
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-background flex flex-col items-center justify-center transition-all duration-400 ${
        phase === "fadeout" ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Logo */}
      <div className="relative mb-8">
        <div className="text-5xl md:text-6xl font-orbitron font-bold text-primary tracking-wider select-none">
          IRNK
        </div>
        {/* Glow behind logo */}
        <div className="absolute inset-0 text-5xl md:text-6xl font-orbitron font-bold text-primary blur-lg opacity-30 tracking-wider select-none flex items-center justify-center">
          IRNK
        </div>
      </div>

      {/* Status text */}
      <div className="font-mono text-xs text-muted-foreground tracking-widest mb-6 h-4">
        {progress < 30 && "INITIALIZING..."}
        {progress >= 30 && progress < 70 && "LOADING_MODULES..."}
        {progress >= 70 && progress < 100 && "ESTABLISHING_CONNECTION..."}
        {progress >= 100 && "SYSTEM_READY"}
      </div>

      {/* Progress bar */}
      <div className="w-48 md:w-64 relative">
        <div className="h-[2px] bg-border/30 w-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-75 ease-out shadow-[0_0_8px_rgba(6,182,212,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Progress percentage */}
        <div className="flex justify-between mt-2">
          <span className="font-mono text-[10px] text-muted-foreground/50">
            SYS.BOOT
          </span>
          <span className="font-mono text-[10px] text-primary/70">
            {progress}%
          </span>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-primary/30" />
      <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-primary/30" />
      <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-primary/30" />
      <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-primary/30" />
    </div>
  );
}
