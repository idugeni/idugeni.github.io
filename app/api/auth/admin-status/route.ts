import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/rbac";

export async function GET() {
  const allowed = await isAdmin();

  return NextResponse.json(
    { isAdmin: allowed },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
