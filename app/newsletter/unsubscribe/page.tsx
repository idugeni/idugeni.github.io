import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { unsubscribeNewsletter } from "@/actions/newsletter";
import { AlertTriangle, CheckCircle } from "@/lib/icons";

export const metadata: Metadata = { title: "Unsubscribe" };

type UnsubscribeSearchParams = Promise<{ token?: string | string[] }>;

function UnsubscribeFallback() {
  return (
    <div
      className="mx-auto max-w-md border border-border/40 bg-secondary/5 p-8 text-center backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <h1 className="mb-4 font-orbitron text-xl font-bold uppercase tracking-widest text-foreground">
        NEWSLETTER_UNSUBSCRIBE
      </h1>
      <div className="flex flex-col items-center justify-center py-6 space-y-3">
        <div className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
          VALIDATING_REQUEST
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          Memvalidasi token unsubscribe Anda...
        </p>
      </div>
    </div>
  );
}

function UnsubscribeResult({ status, message }: { status: "success" | "error"; message: string }) {
  const isSuccess = status === "success";

  return (
    <div className="mx-auto max-w-md border border-border/40 bg-secondary/5 p-8 text-center backdrop-blur-md">
      <h1 className="font-orbitron text-xl font-bold text-foreground mb-4 uppercase tracking-widest">
        NEWSLETTER_UNSUBSCRIBE
      </h1>

      <div className="flex flex-col items-center justify-center py-6 space-y-3">
        {isSuccess ? (
          <CheckCircle className="h-10 w-10 text-success animate-bounce" />
        ) : (
          <AlertTriangle className="h-10 w-10 text-danger" />
        )}
        <p className={`font-mono text-sm font-semibold uppercase ${isSuccess ? "text-success" : "text-danger"}`}>
          {isSuccess ? "Berhasil!" : "Gagal!"}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

async function UnsubscribeRuntimeContent({ searchParams }: { searchParams: UnsubscribeSearchParams }) {
  await connection();

  const params = await searchParams;
  const rawToken = params.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  if (!token) {
    return <UnsubscribeResult status="error" message="Token tidak ditemukan." />;
  }

  try {
    const result = await unsubscribeNewsletter(token);
    return (
      <UnsubscribeResult
        status={result.success ? "success" : "error"}
        message={result.message || (result.success ? "Berhasil berhenti berlangganan." : "Gagal berhenti berlangganan.")}
      />
    );
  } catch {
    return <UnsubscribeResult status="error" message="Terjadi kesalahan sistem." />;
  }
}

export default function UnsubscribePage({ searchParams }: { searchParams: UnsubscribeSearchParams }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Suspense fallback={<UnsubscribeFallback />}>
        <UnsubscribeRuntimeContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
