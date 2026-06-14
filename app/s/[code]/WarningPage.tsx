"use client";

import { useState } from "react";
import type { Shortlink } from "@/actions/shortlinks";
import { AlertTriangle } from "@/lib/icons";

export function WarningPage({ shortlink }: { shortlink: Shortlink }) {
  const [confirmed, setConfirmed] = useState(false);
  const requireConfirmation = shortlink.mode_config.requireConfirmation as boolean;

  const handleContinue = () => {
    if (requireConfirmation && !confirmed) {
      return;
    }
    window.location.href = shortlink.destination_url;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-none border border-warning/30 bg-warning/5 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-warning bg-warning/10">
            <AlertTriangle className="h-6 w-6 text-warning" />
          </div>
          <h1 className="font-orbitron text-2xl font-bold text-foreground">Security Warning</h1>
        </div>

        <div className="space-y-3">
          <p className="text-muted-foreground">
            {(shortlink.mode_config.warningMessage as string) ||
              "This link leads to an external website. Proceed with caution."}
          </p>

          {shortlink.title && (
            <div className="rounded-none border border-border/50 bg-background/50 p-3">
              <p className="text-sm font-medium text-foreground">{shortlink.title}</p>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Destination URL:
            </p>
            <p className="break-all rounded-none border border-border/50 bg-background/50 p-2 font-mono text-xs text-foreground">
              {shortlink.destination_url}
            </p>
          </div>
        </div>

        {requireConfirmation && (
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1"
            />
            <span className="text-muted-foreground">
              I understand the risks and want to proceed to this external website
            </span>
          </label>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleContinue}
            disabled={requireConfirmation && !confirmed}
            className="flex-1 rounded-none bg-primary px-4 py-3 font-mono text-sm text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to Site
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex-1 rounded-none border border-border px-4 py-3 font-mono text-sm hover:bg-secondary"
          >
            Go Back
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Always verify the destination before proceeding
        </p>
      </div>
    </div>
  );
}
