"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { unsubscribeNewsletter } from "@/actions/newsletter";
import { AlertTriangle, CheckCircle, Loader2Icon } from "@/lib/icons";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Memproses permohonan Anda...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token tidak ditemukan.");
      return;
    }

    unsubscribeNewsletter(token)
      .then((result) => {
        if (result.success) {
          setStatus("success");
          setMessage("Anda telah berhasil berhenti berlangganan dari newsletter kami.");
        } else {
          setStatus("error");
          setMessage(result.message || "Gagal berhenti berlangganan.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Terjadi kesalahan sistem.");
      });
  }, [token]);

  return (
    <div className="mx-auto max-w-md border border-border/40 bg-secondary/5 p-8 text-center backdrop-blur-md">
      <h1 className="font-orbitron text-xl font-bold text-foreground mb-4 uppercase tracking-widest">
        NEWSLETTER_UNSUBSCRIBE
      </h1>
      
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-6 space-y-3">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
          <p className="font-mono text-xs text-muted-foreground">{message}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center justify-center py-6 space-y-3">
          <CheckCircle className="h-10 w-10 text-success animate-bounce" />
          <p className="font-mono text-sm text-success font-semibold uppercase">Berhasil!</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center justify-center py-6 space-y-3">
          <AlertTriangle className="h-10 w-10 text-danger" />
          <p className="font-mono text-sm text-danger font-semibold uppercase">Gagal!</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
        </div>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Suspense fallback={
        <div className="text-center font-mono text-xs text-muted-foreground">
          Loading...
        </div>
      }>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
