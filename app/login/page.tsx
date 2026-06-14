import { Suspense } from "react";
import { connection } from "next/server";
import { AuthRuntimeFallback } from "@/components/auth/AuthRuntimeFallback";
import { LoginClient } from "./login-client";

function AuthRouteFallback() {
  return (
    <AuthRuntimeFallback
      title="AUTH SESSION CHECK"
      description="Preparing a secure, request-bound login session. If this takes too long, refresh the page after verifying your connection."
    />
  );
}

async function LoginRuntimeContent() {
  await connection();

  return <LoginClient />;
}

export default function AdminLogin() {
  return (
    <Suspense fallback={<AuthRouteFallback />}>
      <LoginRuntimeContent />
    </Suspense>
  );
}
