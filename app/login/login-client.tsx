"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlitchText } from "@/components/ui/glitch-text";
import { NeonBorder } from "@/components/ui/neon-border";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleBackground } from "@/components/ui/particle-background";
import { Lock, Loader2Icon } from "@/lib/icons";

export function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const triggerShake = () => setShakeKey((k) => k + 1);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginError) {
        setError(`ACCESS_DENIED: ${loginError.message}`);
        triggerShake();
        return;
      }

      const statusResponse = await fetch("/api/auth/admin-status", {
        method: "GET",
        cache: "no-store",
      });
      const status = statusResponse.ok
        ? ((await statusResponse.json()) as { isAdmin?: boolean })
        : { isAdmin: false };

      if (!status.isAdmin) {
        await supabase.auth.signOut();
        setError("ACCESS_DENIED: Admin access required");
        triggerShake();
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("ACCESS_DENIED: Login service unavailable. Please retry.");
      triggerShake();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-background">
      <ParticleBackground />
      <div className="relative z-10 w-full max-w-md px-4 animate-fade-in-up">
        <div className="text-center mb-8">
          <GlitchText text="IRNK_ADMIN" className="text-3xl font-orbitron font-bold text-primary tracking-widest" />
          <p className="font-mono text-xs text-muted-foreground mt-2">RESTRICTED ACCESS LEVEL REQUIRED</p>
        </div>

        <NeonBorder active>
          <form onSubmit={handleSubmit} className="p-8 bg-card/95 backdrop-blur-xl">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
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
                  className="bg-background/50 border-primary/30 focus:border-primary focus:shadow-[0_0_12px_rgba(6,182,212,0.3)] font-mono text-sm rounded-none h-12 transition-all duration-200"
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
                  className="bg-background/50 border-primary/30 focus:border-primary focus:shadow-[0_0_12px_rgba(6,182,212,0.3)] font-mono text-sm rounded-none h-12 transition-all duration-200"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98] h-12 rounded-none tracking-widest transition-all duration-200"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  VERIFYING...
                </span>
              ) : (
                "AUTHORIZE"
              )}
            </Button>

            <div className="mt-4 text-center">
              <Link href="/reset-password" prefetch={false} className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
                Lupa password?
              </Link>
            </div>
          </form>
        </NeonBorder>
      </div>
    </div>
  );
}
