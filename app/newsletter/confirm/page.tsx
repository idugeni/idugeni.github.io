import { queryPooler } from "@/lib/db/pooler";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "@/lib/icons";

interface ConfirmPageProps {
  searchParams: { token?: string };
}

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center space-y-6">
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Token Tidak Valid</h1>
          <p className="text-muted-foreground">
            Token konfirmasi tidak ditemukan. Silakan periksa email Anda atau coba daftar ulang.
          </p>
          <Button asChild>
            <a href="/">Kembali ke Beranda</a>
          </Button>
        </div>
      </div>
    );
  }

  // Verify and confirm the subscription
  try {
    const result = await queryPooler(
      `UPDATE newsletter_subscribers 
       SET confirmed = true, 
           confirmation_token = NULL,
           updated_at = NOW()
       WHERE confirmation_token = $1 AND confirmed = false
       RETURNING email, nama`,
      [token]
    );

    if (result.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md mx-auto text-center space-y-6">
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Konfirmasi Gagal</h1>
            <p className="text-muted-foreground">
              Token konfirmasi tidak valid atau sudah digunakan. Silakan hubungi admin jika Anda mengalami masalah.
            </p>
            <Button asChild>
              <a href="/">Kembali ke Beranda</a>
            </Button>
          </div>
        </div>
      );
    }

    const subscriber = result[0] as { email: string; nama: string | null };

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Berhasil Dikonfirmasi!</h1>
          <div className="space-y-2 text-muted-foreground">
            <p>
              Terima kasih <span className="font-semibold text-foreground">{subscriber.nama || subscriber.email}</span>!
            </p>
            <p>
              Langganan newsletter Anda telah berhasil diaktifkan. Anda akan menerima update terbaru seputar web development, AI, dan teknologi modern langsung ke inbox Anda.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <a href="/blog">Baca Blog</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/">Kembali ke Beranda</a>
            </Button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Confirmation error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center space-y-6">
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Terjadi Kesalahan</h1>
          <p className="text-muted-foreground">
            Maaf, terjadi kesalahan saat memproses konfirmasi Anda. Silakan coba lagi atau hubungi admin.
          </p>
          <Button asChild>
            <a href="/">Kembali ke Beranda</a>
          </Button>
        </div>
      </div>
    );
  }
}

export const metadata = {
  title: "Konfirmasi Newsletter",
  description: "Konfirmasi langganan newsletter Anda",
};
