import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Masuk ke dashboard IRNK Codes. Akses panel administrasi untuk mengelola konten, proyek, dan layanan portfolio Eliyanto Sarage.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    description: "Masuk ke dashboard IRNK Codes untuk mengelola konten dan layanan.",
    url: "https://irnk.codes/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
