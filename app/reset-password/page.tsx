import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { AuthRuntimeFallback } from "@/components/auth/AuthRuntimeFallback";
import { ResetPasswordClient } from "./reset-password-client";

export const metadata: Metadata = {
  title: "Reset Password",
};

function AuthRouteFallback() {
  return (
    <AuthRuntimeFallback
      title="RESET SESSION CHECK"
      description="Preparing the password reset channel with a fresh request context. Refresh if the secure form does not appear shortly."
    />
  );
}

async function ResetPasswordRuntimeContent() {
  await connection();

  return <ResetPasswordClient />;
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<AuthRouteFallback />}>
      <ResetPasswordRuntimeContent />
    </Suspense>
  );
}
