"use client";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlitchTextProps extends React.HTMLAttributes<HTMLHeadingElement> {
  text: string;
}

export function GlitchText({ text, className, ...props }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const handleVisibility = () => {
      if (document.hidden) {
        mountedRef.current = false;
      } else {
        mountedRef.current = true;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    const interval = setInterval(() => {
      if (!mountedRef.current || document.hidden) return;
      if (Math.random() > 0.7) {
        setIsGlitching(true);
        setTimeout(() => {
          if (mountedRef.current) setIsGlitching(false);
        }, 200 + Math.random() * 300);
      }
    }, 2000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div className={cn("relative inline-block", className)} {...props}>
      <span className={cn("relative z-10", isGlitching && "animate-glitch opacity-80 text-primary")}>
        {text}
      </span>
      {isGlitching && (
        <>
          <span className="absolute top-0 left-0 -ml-[2px] text-accent animate-glitch mix-blend-screen opacity-70 z-0 select-none pointer-events-none">
            {text}
          </span>
          <span className="absolute top-0 left-0 ml-[2px] text-destructive animate-glitch mix-blend-screen opacity-70 z-0 select-none pointer-events-none" style={{ animationDirection: 'reverse' }}>
            {text}
          </span>
        </>
      )}
    </div>
  );
}
