"use client";

import { useEffect, useState, useCallback } from "react";
import { HiOutlineBars3, HiOutlineXMark, HiOutlineChevronUp } from "react-icons/hi2";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  label: string;
  number: string;
}

interface TableOfContentsProps {
  items: TocItem[];
  title: string;
}

export function TableOfContents({ items, title }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileOpen(false);
    }
  }, []);

  return (
    <>
      {/* Desktop TOC - Sticky sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24">
          <nav className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
              <span className="font-orbitron text-xs font-bold text-primary tracking-wider">
                {title}
              </span>
            </div>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-md font-mono text-xs transition-all duration-200",
                      activeId === item.id
                        ? "bg-primary/10 text-primary border-l-2 border-primary"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5 border-l-2 border-transparent"
                    )}
                  >
                    <span className={cn(
                      "font-orbitron text-[10px] font-bold shrink-0 w-5",
                      activeId === item.id ? "text-primary" : "text-muted-foreground/50"
                    )}>
                      {item.number}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Back to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 font-mono text-xs text-muted-foreground hover:text-primary border border-border/30 hover:border-primary/30 rounded-md transition-all"
          >
            <HiOutlineChevronUp className="w-3 h-3" />
            <span>BACK_TO_TOP</span>
          </button>
        </div>
      </aside>

      {/* Mobile TOC - Collapsible */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between px-4 py-3 glass-card"
        >
          <div className="flex items-center gap-2">
            <HiOutlineBars3 className={cn("w-4 h-4 transition-colors", mobileOpen ? "text-primary" : "text-muted-foreground")} />
            <span className="font-orbitron text-xs font-bold text-primary tracking-wider">
              {title}
            </span>
          </div>
          <HiOutlineXMark className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            mobileOpen ? "rotate-90" : "rotate-0"
          )} />
        </button>

        {mobileOpen && (
          <nav className="glass-card mt-2 p-4">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-md font-mono text-xs transition-all",
                      activeId === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <span className="font-orbitron text-[10px] font-bold text-muted-foreground/50 w-5">
                      {item.number}
                    </span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
