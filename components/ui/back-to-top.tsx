"use client";

import { useEffect, useState } from "react";
import { LuArrowUp } from "react-icons/lu";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-8 right-8 z-50
        group
        w-12 h-12 rounded-full
        bg-gradient-to-br from-primary via-primary/90 to-primary/80
        shadow-lg shadow-primary/20
        hover:shadow-xl hover:shadow-primary/30
        transition-all duration-300 ease-out
        ${
          isVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-90 pointer-events-none"
        }
      `}
      aria-label="Back to top"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Animated ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300" />
        
        {/* Icon */}
        <LuArrowUp className="w-5 h-5 text-primary-foreground group-hover:-translate-y-0.5 transition-transform duration-300" />
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </button>
  );
}
