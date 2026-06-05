import { Suspense } from "react";
import { connection } from "next/server";
import { UpdatePasswordClient } from "./update-password-client";

function AuthRouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">LOADING_UPDATE</p>
      </div>
    </div>
  );
}

async function UpdatePasswordRuntimeContent() {
  await connection();

  return <UpdatePasswordClient />;
}

export default function UpdatePassword() {
  return (
    <Suspense fallback={<AuthRouteFallback />}>
      <UpdatePasswordRuntimeContent />
    </Suspense>
  );
}
