import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Layanan profesional Full Stack Development, UI/UX Design, dan AI Engineering. Solusi digital custom untuk startup, bisnis, dan enterprise oleh Eliyanto Sarage.",
  openGraph: {
    title: "Services",
    description:
      "Layanan profesional Full Stack Development, UI/UX Design, dan AI Engineering. Solusi digital custom untuk startup, bisnis, dan enterprise.",
    url: "https://irnk.codes/services",
  },
  alternates: {
    canonical: "https://irnk.codes/services",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
