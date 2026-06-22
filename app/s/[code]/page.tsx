import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { headers } from "next/headers";
import type { ShortlinkAccessResult } from "@/actions/shortlinks";
import { getShortlinkByCode, incrementShortlinkClick } from "@/actions/shortlinks";
import { SafelinkPage } from "./SafelinkPage";
import { SplashPage } from "./SplashPage";
import { WarningPage } from "./WarningPage";
import { PasswordGate } from "./PasswordGate";

async function ShortlinkContent({ params }: { params: Promise<{ code: string }> }) {
  await connection();
  const { code } = await params;
  const result: ShortlinkAccessResult = await getShortlinkByCode(code);

  switch (result.status) {
    case "not_found":
      notFound();

    case "not_yet_active":
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="mx-auto max-w-sm space-y-4 text-center">
            <h1 className="font-orbitron text-2xl font-bold text-foreground">Not Yet Active</h1>
            <p className="text-muted-foreground">
              This link will be available on{" "}
              <span className="font-mono text-primary">
                {new Date(result.activates_at).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      );

    case "click_limit_reached":
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="mx-auto max-w-sm space-y-4 text-center">
            <h1 className="font-orbitron text-2xl font-bold text-foreground">Link Expired</h1>
            <p className="text-muted-foreground">
              This link has reached its maximum number of clicks.
            </p>
          </div>
        </div>
      );

    case "password_required":
      return (
        <PasswordGate
          shortlinkId={result.shortlink.id}
          shortlinkCode={result.shortlink.code}
          shortlinkTitle={result.shortlink.title}
        />
      );

    case "ok": {
      const shortlink = result.shortlink;

      // Track click (async, non-blocking)
      const headersList = await headers();
      const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip");
      const userAgent = headersList.get("user-agent");
      const referrer = headersList.get("referer");
      const country =
        headersList.get("x-vercel-ip-country") ||
        headersList.get("cf-ipcountry") ||
        null;

      incrementShortlinkClick(shortlink.id, {
        ip: ip || undefined,
        userAgent: userAgent || undefined,
        referrer: referrer || undefined,
        country: country || undefined,
      }).catch(() => undefined);

      // If code was found via previous_codes (slug history), redirect to current code
      if (shortlink.code !== code) {
        redirect(`/s/${shortlink.code}`);
      }

      switch (shortlink.display_mode) {
        case "direct":
          redirect(shortlink.destination_url);
        case "safelink":
          return <SafelinkPage shortlink={shortlink} />;
        case "splash":
          return <SplashPage shortlink={shortlink} />;
        case "warning":
          return <WarningPage shortlink={shortlink} />;
        default:
          redirect(shortlink.destination_url);
      }
    }
  }
}

function ShortlinkLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16 text-foreground">
      <section
        className="w-full max-w-sm border border-primary/25 bg-card/80 p-6 text-center shadow-[0_0_70px_rgba(0,255,255,0.08)] backdrop-blur"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs font-bold text-primary">
          SAFE
        </div>
        <h1 className="mb-2 font-orbitron text-lg font-bold uppercase tracking-widest text-foreground">
          Memeriksa Link
        </h1>
        <p className="font-mono text-xs leading-relaxed text-muted-foreground">
          Memvalidasi tujuan dan kebijakan keamanan sebelum mengarahkan Anda.
        </p>
      </section>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  await connection();
  const { code } = await params;
  const result: ShortlinkAccessResult = await getShortlinkByCode(code);

  if (result.status === "not_found") {
    return { title: "Link Tidak Ditemukan" };
  }
  if (result.status === "not_yet_active") {
    return { title: "Link Belum Aktif" };
  }
  if (result.status === "click_limit_reached") {
    return { title: "Link Kedaluwarsa" };
  }
  if (result.status === "password_required") {
    return { title: "Verifikasi Password Diperlukan" };
  }

  const shortlink = result.shortlink;
  if (shortlink.display_mode === "safelink") {
    return { title: `Aman: ${shortlink.title || shortlink.code}` };
  }
  if (shortlink.display_mode === "splash") {
    return { title: `Mengarahkan: ${shortlink.title || shortlink.code}` };
  }
  if (shortlink.display_mode === "warning") {
    return { title: `Peringatan Keamanan: ${shortlink.title || shortlink.code}` };
  }

  return { title: shortlink.title || "Mengarahkan..." };
}


export default async function ShortlinkRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  await connection();
  return (
    <Suspense fallback={<ShortlinkLoading />}>
      <ShortlinkContent params={params} />
    </Suspense>
  );
}
