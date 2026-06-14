"use client";

import { useState } from "react";
import type { Shortlink } from "@/actions/shortlinks";
import { verifyShortlinkPassword } from "@/actions/shortlinks";
import { Lock } from "@/lib/icons";
import { SafelinkPage } from "./SafelinkPage";
import { SplashPage } from "./SplashPage";
import { WarningPage } from "./WarningPage";

interface PasswordGateProps {
  shortlinkId: string;
  shortlinkCode: string;
  shortlinkTitle: string | null;
}

export function PasswordGate({ shortlinkId, shortlinkCode, shortlinkTitle }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedShortlink, setVerifiedShortlink] = useState<Shortlink | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    try {
      const result = await verifyShortlinkPassword(shortlinkId, password);
      if (result) {
        // Password correct — handle display mode
        if (result.display_mode === "direct") {
          window.location.href = result.destination_url;
          return;
        }
        setVerifiedShortlink(result);
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // After password verified, render the appropriate display mode
  if (verifiedShortlink) {
    switch (verifiedShortlink.display_mode) {
      case "safelink":
        return <SafelinkPage shortlink={verifiedShortlink} />;
      case "splash":
        return <SplashPage shortlink={verifiedShortlink} />;
      case "warning":
        return <WarningPage shortlink={verifiedShortlink} />;
      default:
        // Direct mode handled above
        return null;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-orbitron text-2xl font-bold text-foreground">Password Required</h1>
          {shortlinkTitle && (
            <p className="mt-2 text-sm text-muted-foreground">{shortlinkTitle}</p>
          )}
          <p className="mt-1 font-mono text-xs text-muted-foreground">/{shortlinkCode}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoFocus
              className="w-full rounded-none border border-primary/30 bg-secondary/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isVerifying || !password}
            className="w-full rounded-none bg-primary px-4 py-3 font-mono text-sm text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isVerifying ? "Verifying..." : "Unlock"}
          </button>
        </form>

        <button
          onClick={() => window.history.back()}
          className="w-full font-mono text-xs text-muted-foreground hover:text-primary"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
