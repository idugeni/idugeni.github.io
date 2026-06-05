"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Announcement } from "@/actions/announcements";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, X } from "@/lib/icons";

export function AnnouncementModal() {
  const pathname = usePathname();
  const [modal, setModal] = useState<Announcement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const fetchAndFilterModal = async () => {
      try {
        const response = await fetch("/api/announcements", {
          cache: "force-cache",
        });

        const announcements = response.ok
          ? ((await response.json()) as Announcement[])
          : [];
        
        // Find first active modal matching pathname
        const matchingModal = announcements.find((item) => {
          if (item.placement !== "modal") return false;
          
          if (item.target_page === "*") return true;
          return pathname === item.target_page;
        });

        if (matchingModal) {
          const dismissedList = JSON.parse(localStorage.getItem("dismissed_announcements") || "[]");
          if (!dismissedList.includes(matchingModal.id)) {
            setModal(matchingModal);
            // Open modal shortly after mount for premium feeling
            timer = setTimeout(() => setIsOpen(true), 1500);
          }
        }
      } catch {
        setIsOpen(false);
      }
    };

    if (pathname?.startsWith("/admin")) {
      setIsOpen(false);
      return;
    }

    fetchAndFilterModal();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pathname]);

  const handleClose = () => {
    setIsOpen(false);
    if (modal && modal.dismissible) {
      const dismissedList = JSON.parse(localStorage.getItem("dismissed_announcements") || "[]");
      dismissedList.push(modal.id);
      localStorage.setItem("dismissed_announcements", JSON.stringify(dismissedList));
    }
  };

  if (!isOpen || !modal) return null;

  const getBorderColor = () => {
    switch (modal.type) {
      case "info": return "border-cyan-500/30";
      case "warning": return "border-amber-500/30";
      case "success": return "border-emerald-500/30";
      case "danger": return "border-red-500/30";
      case "primary": return "border-primary/30";
      default: return "border-border/40";
    }
  };

  const getIconContainer = () => {
    switch (modal.type) {
      case "info": return "border-cyan-500/30 bg-cyan-950/20 text-cyan-400";
      case "warning": return "border-amber-500/30 bg-amber-950/20 text-amber-400";
      case "success": return "border-emerald-500/30 bg-emerald-950/20 text-emerald-400";
      case "danger": return "border-red-500/30 bg-red-950/20 text-red-400";
      case "primary": return "border-primary/30 bg-primary/10 text-primary";
      default: return "border-border/40 bg-secondary/30 text-muted-foreground";
    }
  };

  const getIcon = () => {
    switch (modal.type) {
      case "success": return <CheckCircle className="h-6 w-6 text-emerald-400" />;
      case "warning":
      case "danger":
        return <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />;
      default: return <Info className="h-6 w-6 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className={`w-full max-w-md border bg-card/95 p-8 text-center shadow-2xl relative font-mono text-xs ${getBorderColor()}`}
      >
        {modal.dismissible && (
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className={`mx-auto w-12 h-12 border flex items-center justify-center rounded-full mb-4 ${getIconContainer()}`}>
          {getIcon()}
        </div>

        <div className="space-y-3 mb-6">
          <h3 className="font-orbitron text-base font-bold uppercase tracking-wider text-foreground">
            {modal.title}
          </h3>
          <p className="text-muted-foreground text-[11px] leading-relaxed whitespace-pre-line text-center">
            {modal.content}
          </p>
        </div>

        <div className="space-y-2">
          {modal.cta_label && modal.cta_url && (
            <a href={modal.cta_url} onClick={handleClose} className="block w-full">
              <Button className="w-full rounded-none bg-primary font-mono text-xs text-primary-foreground">
                {modal.cta_label}
              </Button>
            </a>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full rounded-none font-mono text-xs"
          >
            CLOSE
          </Button>
        </div>
      </div>
    </div>
  );
}
