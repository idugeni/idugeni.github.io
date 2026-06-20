"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlitchText } from "@/components/ui/glitch-text";
import { NeonBorder } from "@/components/ui/neon-border";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleBackground } from "@/components/ui/particle-background";
import { CheckCircle, Lock, Loader2Icon, Shield } from "@/lib/icons";

type LoginPhase = "idle" | "authenticating" | "checking-admin" | "redirecting";

type PhaseView = {
  label: string;
  detail: string;
  progress: string;
};

const phaseViews: Record<LoginPhase, PhaseView> = {
  idle: {
    label: "AUTHORIZE",
    detail: "Awaiting encrypted credential input",
    progress: "0%",
  },
  authenticating: {
    label: "VERIFYING...",
    detail: "Validating Supabase identity token",
    progress: "38%",
  },
  "checking-admin": {
    label: "CHECKING_ACCESS...",
    detail: "Matching session against admin allowlist",
    progress: "72%",
  },
  redirecting: {
    label: "ACCESS_GRANTED...",
    detail: "Launching admin command center",
    progress: "100%",
  },
};

const phaseTimeline: Array<{ phase: Exclude<LoginPhase, "idle">; label: string }> = [
  { phase: "authenticating", label: "IDENTITY" },
  { phase: "checking-admin", label: "AUTHZ" },
  { phase: "redirecting", label: "HANDOFF" },
];

export function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<LoginPhase>("idle");
  const [shakeKey, setShakeKey] = useState(0);

  const isPending = phase !== "idle";
  const phaseView = phaseViews[phase];
  const activePhaseIndex = useMemo(() => {
    if (phase === "idle") return -1;
    return phaseTimeline.findIndex((item) => item.phase === phase);
  }, [phase]);

  const triggerShake = () => setShakeKey((k) => k + 1);

  const resetFailedAttempt = (message: string) => {
    setError(message);
    setPhase("idle");
    triggerShake();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isPending) return;

    setError("");
    setPhase("authenticating");

    try {
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginError) {
        resetFailedAttempt(`ACCESS_DENIED: ${loginError.message}`);
        return;
      }

      setPhase("checking-admin");

      const statusResponse = await fetch("/api/auth/admin-status", {
        method: "GET",
        cache: "no-store",
      });
      const status = statusResponse.ok
        ? ((await statusResponse.json()) as { isAdmin?: boolean })
        : { isAdmin: false };

      if (!status.isAdmin) {
        await supabase.auth.signOut();
        resetFailedAttempt("ACCESS_DENIED: Admin access required");
        return;
      }

      setPhase("redirecting");
      router.replace("/admin");
      router.refresh();
    } catch {
      resetFailedAttempt("ACCESS_DENIED: Login service unavailable. Please retry.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-background overflow-hidden">
      <ParticleBackground />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.14),transparent_48%)]" />
      <div className="relative z-10 w-full max-w-md px-4 animate-fade-in-up">
        <div className="text-center mb-8">
          <GlitchText text="IRNK_ADMIN" className="text-3xl font-orbitron font-bold text-primary tracking-widest" />
          <p className="font-mono text-xs text-muted-foreground mt-2">RESTRICTED ACCESS LEVEL REQUIRED</p>
        </div>

        <NeonBorder active>
          <form onSubmit={handleSubmit} className="relative overflow-hidden p-8 bg-card/95 backdrop-blur-xl">
            {phase === "redirecting" && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 animate-pulse" />
            )}
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div
                  className={`w-12 h-12 border rounded-full flex items-center justify-center transition-all duration-500 ${
                    phase === "redirecting"
                      ? "bg-primary/20 border-primary text-primary shadow-[0_0_30px_rgba(6,182,212,0.45)] scale-110"
                      : isPending
                        ? "bg-primary/10 border-primary/60 text-primary shadow-[0_0_22px_rgba(6,182,212,0.28)]"
                        : "bg-primary/10 border-primary/30 text-primary"
                  }`}
                >
                  {phase === "redirecting" ? (
                    <CheckCircle className="w-6 h-6 animate-pulse" />
                  ) : isPending ? (
                    <Shield className="w-6 h-6 animate-pulse" />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>
              </div>

              <div className="mb-6 rounded-sm border border-primary/20 bg-background/35 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-wider">
                  <span className="text-primary">AUTH_PIPELINE</span>
                  <span className="text-muted-foreground">{phaseView.progress}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-secondary/60">
                  <div
                    className="h-full rounded-full bg-primary shadow-[0_0_14px_rgba(6,182,212,0.65)] transition-all duration-700 ease-out"
                    style={{ width: phaseView.progress }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {phaseTimeline.map((item, index) => {
                    const active = activePhaseIndex >= index;
                    const current = activePhaseIndex === index;
                    return (
                      <div
                        key={item.phase}
                        className={`rounded border px-2 py-1 text-center font-mono text-[9px] transition-all duration-500 ${
                          active
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border/40 bg-background/30 text-muted-foreground/60"
                        } ${current ? "shadow-[0_0_14px_rgba(6,182,212,0.22)]" : ""}`}
                      >
                        {item.label}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 min-h-4 text-center font-mono text-[10px] text-muted-foreground transition-colors duration-300">
                  {phaseView.detail}
                </p>
              </div>

              {error && (
                <div key={shakeKey} className="mb-6 p-3 border border-destructive/50 bg-destructive/10 text-destructive text-xs font-mono text-center animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-mono text-[10px] text-primary tracking-wider">IDENTIFIER</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={isPending}
                    className="bg-background/50 border-primary/30 focus:border-primary focus:shadow-[0_0_12px_rgba(6,182,212,0.3)] font-mono text-sm rounded-none h-12 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-mono text-[10px] text-primary tracking-wider">SECURITY_KEY</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={isPending}
                    className="bg-background/50 border-primary/30 focus:border-primary focus:shadow-[0_0_12px_rgba(6,182,212,0.3)] font-mono text-sm rounded-none h-12 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={`relative w-full overflow-hidden font-mono bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98] h-12 rounded-none tracking-widest transition-all duration-300 ${
                  phase === "redirecting" ? "shadow-[0_0_28px_rgba(6,182,212,0.45)]" : ""
                }`}
                disabled={isPending}
              >
                {isPending && (
                  <span className="absolute inset-y-0 left-0 w-1/3 animate-[pulse_1.15s_ease-in-out_infinite] bg-white/10 blur-md" />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  {phase === "redirecting" ? (
                    <CheckCircle className="h-4 w-4 animate-pulse" />
                  ) : isPending ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : null}
                  {phaseView.label}
                </span>
              </Button>

              <div className="mt-4 text-center">
                <Link
                  href="/reset-password"
                  prefetch={false}
                  aria-disabled={isPending}
                  className={`font-mono text-xs transition-colors ${
                    isPending
                      ? "pointer-events-none text-muted-foreground/40"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  Lupa password?
                </Link>
              </div>
            </div>
          </form>
        </NeonBorder>
      </div>
    </div>
  );
}
