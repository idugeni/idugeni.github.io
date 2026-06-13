import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RiShieldStarLine } from "react-icons/ri";

export const metadata: Metadata = { title: "Unauthorized" };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full" />
              <RiShieldStarLine className="relative w-24 h-24 text-destructive" strokeWidth={1.5} />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              ACCESS DENIED
            </h1>
            <p className="text-lg text-muted-foreground">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </div>

          {/* Description */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Halaman ini hanya dapat diakses oleh administrator. 
              Jika Anda yakin seharusnya memiliki akses, silakan hubungi tim teknis.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default" size="lg">
              <Link href="/">
                Kembali ke Beranda
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">
                Login dengan Akun Lain
              </Link>
            </Button>
          </div>

          {/* Error Code */}
          <div className="pt-4">
            <p className="text-xs text-muted-foreground font-mono">
              ERROR CODE: 403 FORBIDDEN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
