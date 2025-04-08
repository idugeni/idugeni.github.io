"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import "tw-animate-css";

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
    __turnstileScriptLoaded?: boolean;
  }
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  siteKey,
  onVerify,
  className,
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!widgetRef.current) return;
  
    let cancelled = false;
  
    const initialize = () => {
      if (
        cancelled ||
        !widgetRef.current ||
        widgetRef.current.hasChildNodes()
      )
        return;
  
      window.turnstile?.render(widgetRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          setIsLoading(false);
          onVerify(token);
        },
        "error-callback": () => {
          toast.error("Verifikasi captcha gagal. Silakan muat ulang.");
        },
        "expired-callback": () => {
          toast.warning("Token captcha kedaluwarsa. Muat ulang dan coba lagi.");
        },
      });
  
      setIsLoading(false);
    };
  
    if (!("turnstile" in window)) {
      if (!window.__turnstileScriptLoaded) {
        const script = document.createElement('script');
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstileCallback";
        script.async = true;
        script.defer = true;
        script.setAttribute("onload", "onloadTurnstileCallback");
        document.head.appendChild(script);
        window.__turnstileScriptLoaded = true;
  
        // ⬇️ Tambahkan callback global agar dipanggil saat script selesai dimuat
        window.onloadTurnstileCallback = () => {
          initialize();
        };
      }
      else {
        // Script tag already added previously
        const existingScript = document.querySelector('script[src*="turnstile"]');
        if(existingScript) {
          existingScript.setAttribute("onload", "onloadTurnstileCallback");
        }
      }

      return () => {
        cancelled = true;
        const existingScript = document.querySelector('script[src*="turnstile"]');
        if(existingScript && existingScript.parentNode) {
            existingScript.parentNode.removeChild(existingScript);
            window.__turnstileScriptLoaded = false;
        }
      };
    } else {
      initialize();
    }
  
    return () => {
      cancelled = true;
    };
  }, [siteKey, onVerify]);

  return (
    <div
      className={clsx(
        "flex justify-center transition-all duration-300 animate__animated animate__fadeIn",
        className
      )}
    >
      {isLoading && (
        <div className="mb-3 text-center text-sm text-muted-foreground">
          Memuat verifikasi CAPTCHA...
        </div>
      )}
      <div ref={widgetRef} />
    </div>
  );
};

export default TurnstileWidget;
