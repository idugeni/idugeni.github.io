"use client";

import { useEffect } from "react";
import type { Shortlink } from "@/actions/shortlinks";

export function SplashPage({ shortlink }: { shortlink: Shortlink }) {
  // Respect custom splash fields if provided, fallback to mode_config
  const delay = shortlink.splash_timer !== undefined && shortlink.splash_timer !== null
    ? shortlink.splash_timer * 1000
    : (shortlink.mode_config.delay as number) || 2000;

  const brandColor = (shortlink.mode_config.brandColor as string) || "#06b6d4";
  const brandMessage = shortlink.splash_title || (shortlink.mode_config.brandMessage as string) || shortlink.title || "Redirecting...";

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = shortlink.destination_url;
    }, delay);
    return () => clearTimeout(timer);
  }, [shortlink.destination_url, delay]);

  const socialLinks = shortlink.splash_social_links as Record<string, string> || {};
  const hasSocials = Object.values(socialLinks).some(url => !!url);

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 bg-background"
      style={{
        background: `radial-gradient(circle at center, ${brandColor}15 0%, hsl(var(--background)) 100%)`,
      }}
    >
      <div className="mx-auto w-full max-w-md space-y-8 text-center border border-border/40 bg-secondary/5 p-8 rounded-none backdrop-blur-md">
        {shortlink.mode_config.brandLogo && (
          <div className="flex justify-center">
            <img
              src={shortlink.mode_config.brandLogo as string}
              alt="Brand Logo"
              className="h-20 w-20 object-contain animate-pulse"
            />
          </div>
        )}

        <div className="space-y-3">
          <h1 className="font-orbitron text-xl font-bold text-foreground leading-snug">
            {brandMessage}
          </h1>
          {shortlink.description && (
            <p className="text-sm text-muted-foreground">{shortlink.description}</p>
          )}
        </div>

        <div className="flex justify-center gap-2.5 py-2">
          <div
            className="h-2.5 w-2.5 animate-bounce rounded-full"
            style={{ backgroundColor: brandColor, animationDelay: "0ms" }}
          />
          <div
            className="h-2.5 w-2.5 animate-bounce rounded-full"
            style={{ backgroundColor: brandColor, animationDelay: "150ms" }}
          />
          <div
            className="h-2.5 w-2.5 animate-bounce rounded-full"
            style={{ backgroundColor: brandColor, animationDelay: "300ms" }}
          />
        </div>

        {/* Social Networks Links */}
        {hasSocials && (
          <div className="space-y-3 pt-6 border-t border-border/20">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Connect with us</p>
            <div className="flex justify-center gap-4">
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-border/60 hover:border-primary text-muted-foreground hover:text-primary transition-all duration-300 rounded-none bg-background/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-border/60 hover:border-primary text-muted-foreground hover:text-primary transition-all duration-300 rounded-none bg-background/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {socialLinks.website && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-border/60 hover:border-primary text-muted-foreground hover:text-primary transition-all duration-300 rounded-none bg-background/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground border-t border-border/20 pt-4">
          Taking you to <span className="font-mono text-primary break-all">{shortlink.destination_url.replace(/^https?:\/\//, "")}</span>
        </p>
      </div>
    </div>
  );
}
