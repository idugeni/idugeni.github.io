import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { AuthRuntimeFallback } from "@/components/auth/AuthRuntimeFallback";
import { UpdatePasswordClient } from "./update-password-client";

export const metadata: Metadata = {
  title: "Update Password",
};

function AuthRouteFallback() {
  return (
    <AuthRuntimeFallback
      title="PASSWORD UPDATE CHECK"
      description="Validating the secure password update context. Refresh if the form does not become available shortly."
    />
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
