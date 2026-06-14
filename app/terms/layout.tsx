import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Syarat dan ketentuan penggunaan layanan IRNK Codes. Panduan lengkap mengenai hak, kewajiban, dan aturan penggunaan situs web dan layanan kami.",
  openGraph: {
    description:
      "Syarat dan ketentuan penggunaan layanan IRNK Codes. Panduan lengkap mengenai hak, kewajiban, dan aturan penggunaan situs.",
    url: "https://irnk.codes/terms",
  },
  alternates: {
    canonical: "https://irnk.codes/terms",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
