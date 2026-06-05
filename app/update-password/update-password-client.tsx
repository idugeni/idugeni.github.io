"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlitchText } from "@/components/ui/glitch-text";
import { NeonBorder } from "@/components/ui/neon-border";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleBackground } from "@/components/ui/particle-background";
import { HiOutlineLockClosed, HiOutlineCheckCircle } from "react-icons/hi2";

export function UpdatePasswordClient() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let active = true;

    async function verifyRecoverySession() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();

        if (!active) return;

        const sessionAvailable = Boolean(data.session?.user);
        setHasSession(sessionAvailable);
        if (!sessionAvailable) {
          setError("RESET_SESSION_EXPIRED: Please request a new password reset link.");
        }
      } catch {
        if (active) {
          setHasSession(false);
          setError("RESET_SESSION_UNAVAILABLE: Please reopen the reset link.");
        }
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    void verifyRecoverySession();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!hasSession) {
      setError("RESET_SESSION_EXPIRED: Please request a new password reset link.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(`PASSWORD_UPDATE_FAILED: ${updateError.message}`);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.replace("/login"), 2000);
    } catch {
      setError("PASSWORD_UPDATE_FAILED: Please retry with a fresh reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-background">
      <ParticleBackground />
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <GlitchText text="NEW_PASSWORD" className="text-3xl font-orbitron font-bold text-primary tracking-widest" />
          <p className="font-mono text-xs text-muted-foreground mt-2">SET NEW SECURITY KEY</p>
        </div>

        <NeonBorder active>
          <div className="p-8 bg-card/95 backdrop-blur-xl">
            {success ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <HiOutlineCheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-orbitron font-bold text-lg text-primary mb-2">
                  PASSWORD_UPDATED
                </h3>
                <p className="font-mono text-sm text-muted-foreground">
                  Redirecting ke login...
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center">
                    <HiOutlineLockClosed className="w-6 h-6 text-primary" />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 border border-destructive/50 bg-destructive/10 text-destructive text-xs font-mono text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-mono text-[10px] text-primary tracking-wider">
                      NEW_PASSWORD
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="bg-background/50 border-primary/30 focus:border-primary font-mono text-sm rounded-none h-12"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm" className="font-mono text-[10px] text-primary tracking-wider">
                      CONFIRM_PASSWORD
                    </Label>
                    <Input
                      id="confirm"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="bg-background/50 border-primary/30 focus:border-primary font-mono text-sm rounded-none h-12"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-none tracking-widest"
                    disabled={loading || checkingSession || !hasSession}
                  >
                    {checkingSession ? "CHECKING_SESSION..." : loading ? "UPDATING..." : "UPDATE_PASSWORD"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </NeonBorder>
      </div>
    </div>
  );
}
