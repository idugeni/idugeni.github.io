import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Kenali Eliyanto Sarage — Full Stack Developer, UI/UX Designer, dan AI Engineer dengan 5+ tahun pengalaman membangun solusi digital premium untuk bisnis modern.",
  openGraph: {
    description:
      "Full Stack Developer, UI/UX Designer, dan AI Engineer dengan 5+ tahun pengalaman membangun solusi digital premium untuk bisnis modern.",
    url: "https://irnk.codes/about",
  },
  alternates: {
    canonical: "https://irnk.codes/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
