"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import "tw-animate-css";

interface ReCaptchaWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  className?: string;
}

interface ReCaptcha {
  render: (
    container: HTMLElement | string,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    }
  ) => number;
  reset: (widgetId?: number) => void;
  getResponse: (widgetId?: number) => string;
  execute: (widgetId?: number) => void;
}

declare global {
  interface Window {
    grecaptcha?: ReCaptcha;
    __recaptchaScriptLoaded?: boolean;
    onloadReCaptchaCallback?: () => void;
  }
}

const ReCaptchaWidget: React.FC<ReCaptchaWidgetProps> = ({
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
        widgetRef.current.querySelector('.g-recaptcha-response')
      )
        return;
      
      setIsLoading(false);
    };
  
    if (!("grecaptcha" in window)) {
      if (!window.__recaptchaScriptLoaded) {
        const script = document.createElement('script');
        script.src = "https://www.google.com/recaptcha/api.js?onload=onloadReCaptchaCallback&render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        window.__recaptchaScriptLoaded = true;
  
        // Tambahkan callback global agar dipanggil saat script selesai dimuat
        window.onloadReCaptchaCallback = () => {
          initialize();
        };
      }
      else {
        // Script tag already added previously
        const existingScript = document.querySelector('script[src*="recaptcha"]');
        if(existingScript) {
          existingScript.setAttribute("onload", "onloadReCaptchaCallback");
        }
      }

      return () => {
        cancelled = true;
        const existingScript = document.querySelector('script[src*="recaptcha"]');
        if(existingScript && existingScript.parentNode) {
            existingScript.parentNode.removeChild(existingScript);
            window.__recaptchaScriptLoaded = false;
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
      <div 
        ref={widgetRef} 
        className="g-recaptcha" 
        data-sitekey={siteKey}
        data-callback={(token: string) => onVerify(token)}
        data-expired-callback={() => toast.warning("Token captcha kedaluwarsa. Muat ulang dan coba lagi.")}
        data-error-callback={() => toast.error("Verifikasi captcha gagal. Silakan muat ulang.")}
      />
    </div>
  );
};

export default ReCaptchaWidget;