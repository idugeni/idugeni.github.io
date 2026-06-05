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
import { Lock } from "@/lib/icons";

export function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

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
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("ACCESS_DENIED: Login service unavailable. Please retry.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-background">
      <ParticleBackground />
      <div className="relative z-10 w-full max-w-md px-4">
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
              <div className="mb-6 p-3 border border-destructive/50 bg-destructive/10 text-destructive text-xs font-mono text-center animate-pulse">
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
                  className="bg-background/50 border-primary/30 focus:border-primary font-mono text-sm rounded-none h-12"
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
                  className="bg-background/50 border-primary/30 focus:border-primary font-mono text-sm rounded-none h-12"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-none tracking-widest"
              disabled={isPending}
            >
              {isPending ? "VERIFYING..." : "AUTHORIZE"}
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
