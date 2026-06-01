"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlitchText } from "@/components/ui/glitch-text";
import { NeonBorder } from "@/components/ui/neon-border";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleBackground } from "@/components/ui/particle-background";
import { HiOutlineEnvelope, HiOutlineCheckCircle, HiOutlineArrowLeft } from "react-icons/hi2";
import Link from "next/link";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-background">
      <ParticleBackground />
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <GlitchText text="RESET_ACCESS" className="text-3xl font-orbitron font-bold text-primary tracking-widest" />
          <p className="font-mono text-xs text-muted-foreground mt-2">PASSWORD RECOVERY SYSTEM</p>
        </div>

        <NeonBorder active>
          <div className="p-8 bg-card/95 backdrop-blur-xl">
            {sent ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <HiOutlineCheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-orbitron font-bold text-lg text-primary mb-2">
                  LINK_TRANSMITTED
                </h3>
                <p className="font-mono text-sm text-muted-foreground mb-6">
                  Link reset password telah dikirim ke <span className="text-foreground">{email}</span>. Cek inbox Anda.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="font-mono border-primary/50">
                    <HiOutlineArrowLeft className="mr-2 w-4 h-4" /> BACK_TO_LOGIN
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center">
                    <HiOutlineEnvelope className="w-6 h-6 text-primary" />
                  </div>
                </div>

                <p className="font-mono text-xs text-muted-foreground text-center mb-6">
                  Masukkan email yang terdaftar. Kami akan mengirim link untuk reset password.
                </p>

                {error && (
                  <div className="mb-4 p-3 border border-destructive/50 bg-destructive/10 text-destructive text-xs font-mono text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-mono text-[10px] text-primary tracking-wider">
                      EMAIL_ADDRESS
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      className="bg-background/50 border-primary/30 focus:border-primary font-mono text-sm rounded-none h-12"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-none tracking-widest"
                    disabled={loading}
                  >
                    {loading ? "PROCESSING..." : "SEND_RESET_LINK"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/login" className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
                    ← Kembali ke login
                  </Link>
                </div>
              </>
            )}
          </div>
        </NeonBorder>
      </div>
    </div>
  );
}
