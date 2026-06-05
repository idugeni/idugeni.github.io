"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Announcement } from "@/actions/announcements";
import { AlertTriangle, CheckCircle, Info, X } from "@/lib/icons";

export function AnnouncementBanner() {
  const pathname = usePathname();
  const [banner, setBanner] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchAndFilterBanner = async () => {
      try {
        const response = await fetch("/api/announcements", {
          cache: "force-cache",
        });

        const announcements = response.ok
          ? ((await response.json()) as Announcement[])
          : [];
        
        // Find first active banner matching current pathname
        const matchingBanner = announcements.find((item) => {
          if (item.placement !== "banner") return false;
          
          // Route targeting logic
          if (item.target_page === "*") return true;
          return pathname === item.target_page;
        });

        if (matchingBanner) {
          // Check if user dismissed this banner before
          const dismissedList = JSON.parse(localStorage.getItem("dismissed_announcements") || "[]");
          if (!dismissedList.includes(matchingBanner.id)) {
            setBanner(matchingBanner);
            setIsVisible(true);
          }
        } else {
          setIsVisible(false);
        }
      } catch {
        setIsVisible(false);
      }
    };

    // Skip banner rendering inside admin pages completely to avoid double visual noise!
    if (pathname?.startsWith("/admin")) {
      setIsVisible(false);
      return;
    }

    fetchAndFilterBanner();
  }, [pathname]);

  const handleDismiss = () => {
    if (!banner) return;
    setIsVisible(false);

    if (banner.dismissible) {
      const dismissedList = JSON.parse(localStorage.getItem("dismissed_announcements") || "[]");
      dismissedList.push(banner.id);
      localStorage.setItem("dismissed_announcements", JSON.stringify(dismissedList));
    }
  };

  if (!isVisible || !banner) return null;

  const getStyles = () => {
    switch (banner.type) {
      case "info": return "border-cyan-500/20 bg-cyan-950/40 text-cyan-300";
      case "warning": return "border-amber-500/20 bg-amber-950/40 text-amber-300";
      case "success": return "border-emerald-500/20 bg-emerald-950/40 text-emerald-300";
      case "danger": return "border-red-500/20 bg-red-950/40 text-red-300";
      case "primary": return "border-primary/20 bg-primary/10 text-primary";
      default: return "border-border/30 bg-secondary/20 text-muted-foreground";
    }
  };

  const getIcon = () => {
    switch (banner.type) {
      case "success": return <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />;
      case "warning":
      case "danger":
        return <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 animate-pulse" />;
      default: return <Info className="h-4 w-4 shrink-0 text-cyan-400" />;
    }
  };

  return (
    <div
      className={`w-full border-b py-2 px-4 flex items-center justify-between gap-4 font-mono text-[11px] animate-in slide-in-from-top duration-300 ${getStyles()}`}
    >
      <div className="mx-auto flex items-center gap-2 flex-wrap justify-center">
        {getIcon()}
        <span className="font-bold uppercase tracking-wider">{banner.title}:</span>
        <span className="opacity-90">{banner.content}</span>
        {banner.cta_label && banner.cta_url && (
          <a
            href={banner.cta_url}
            className="underline font-bold text-foreground hover:opacity-85 transition-opacity ml-1.5 flex items-center"
          >
            {banner.cta_label}
          </a>
        )}
      </div>
      {banner.dismissible && (
        <button
          onClick={handleDismiss}
          className="hover:opacity-75 transition-opacity p-0.5"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
