import { Suspense } from "react";
import { connection } from "next/server";
import { unsubscribeNewsletter } from "@/actions/newsletter";
import { AlertTriangle, CheckCircle, Loader2Icon } from "@/lib/icons";

type UnsubscribeSearchParams = Promise<{ token?: string | string[] }>;

function UnsubscribeFallback() {
  return (
    <div className="mx-auto max-w-md border border-border/40 bg-secondary/5 p-8 text-center backdrop-blur-md">
      <h1 className="font-orbitron text-xl font-bold text-foreground mb-4 uppercase tracking-widest">
        NEWSLETTER_UNSUBSCRIBE
      </h1>
      <div className="flex flex-col items-center justify-center py-6 space-y-3">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
        <p className="font-mono text-xs text-muted-foreground">Memproses permohonan Anda...</p>
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
