import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Resume profesional Eliyanto Sarage — pengalaman kerja, keahlian teknis, sertifikasi, dan riwayat pendidikan sebagai Full Stack Developer dan AI Engineer.",
  openGraph: {
    title: "Resume",
    description:
      "Resume profesional — pengalaman kerja, keahlian teknis, sertifikasi, dan riwayat pendidikan sebagai Full Stack Developer dan AI Engineer.",
    url: "https://irnk.codes/resume",
  },
  alternates: {
    canonical: "https://irnk.codes/resume",
  },
};

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
