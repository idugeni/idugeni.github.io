"use client";

import { useState, useEffect, useRef } from "react";

interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const slugCount: Record<string, number> = {};
  const regex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const level = parseInt(match[1]) as 2 | 3;
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    if (text) {
      let slug = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      if (slugCount[slug] !== undefined) {
        slugCount[slug]++;
        slug = `${slug}-${slugCount[slug]}`;
      } else {
        slugCount[slug] = 0;
      }
      headings.push({ id: slug, text, level });
    }
  }
  return headings;
}

const SCROLL_OFFSET = 96;

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-16 left-0 h-0.5 bg-primary z-50 transition-all duration-150"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
}

export function TableOfContents({
  headings,
  activeId,
  onItemClick,
}: {
  headings: TocHeading[];
  activeId: string | null;
  onItemClick?: (id: string) => void;
}) {
  const activeItemRef = useRef<HTMLAnchorElement>(null);

  if (headings.length === 0) return null;

  const activeIndex = headings.findIndex((h) => h.id === activeId);
  const progressPercent = activeIndex >= 0 ? ((activeIndex + 1) / headings.length) * 100 : 0;

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeId]);

  return (
    <div className="border border-border/50 bg-secondary/30 p-4 rounded-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-orbitron text-xs font-bold text-primary uppercase">Table of Contents</h4>
        <span className="font-mono text-[10px] text-muted-foreground">
          {activeIndex >= 0 ? activeIndex + 1 : 0}/{headings.length}
        </span>
      </div>
      <div className="h-0.5 bg-border/50 rounded-full mb-3 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-300 ease-out" style={{ width: `${progressPercent}%` }} />
      </div>
      <nav aria-label="Table of contents" role="navigation">
        <ol className="space-y-0.5 list-none m-0 p-0 max-h-[300px] overflow-y-auto pr-2">
          {headings.map((h) => (
            <li key={h.id} className="m-0 p-0">
              <a
                ref={activeId === h.id ? activeItemRef : null}
                href={`#${h.id}`}
                onClick={(e) => { e.preventDefault(); onItemClick?.(h.id); }}
                aria-current={activeId === h.id ? "location" : undefined}
                className={`block font-mono text-xs py-1.5 rounded transition-all duration-200 border-l-2 no-underline ${h.level === 3 ? "pl-5" : "pl-2"} ${activeId === h.id ? "text-primary bg-primary/10 border-primary font-medium" : "text-muted-foreground border-transparent hover:text-foreground hover:border-primary/40 hover:bg-primary/5"}`}
              >
                <span className="line-clamp-2">{h.text}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

export function MobileTocDrawer({
  headings,
  activeId,
  onItemClick,
}: {
  headings: TocHeading[];
  activeId: string | null;
  onItemClick: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  if (headings.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open table of contents"
        className="lg:hidden fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-[300px] max-w-[85vw] bg-background border-l border-border/50 p-6 overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-orbitron text-sm font-bold text-primary uppercase">Contents</h4>
              <button onClick={() => setOpen(false)} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav aria-label="Table of contents">
              <ol className="space-y-1 list-none m-0 p-0">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      onClick={(e) => { e.preventDefault(); onItemClick(h.id); setOpen(false); }}
                      className={`flex items-center gap-2 font-mono text-sm py-2 px-3 rounded no-underline transition-all ${h.level === 3 ? "pl-6" : "pl-3"} ${activeId === h.id ? "text-primary bg-primary/10 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
                    >
                      <span className="line-clamp-2">{h.text}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export function useActiveHeading(headings: TocHeading[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const ids = headings.map((h) => h.id);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: `-${SCROLL_OFFSET}px 0px -60% 0px`, threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return activeId;
}

export function scrollToHeading(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  }
}
