import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Artikel dan insight tentang web development, AI engineering, UI/UX design, dan teknologi terkini dari Eliyanto Sarage. Tips, tutorial, dan best practices.",
  openGraph: {
    description:
      "Artikel dan insight tentang web development, AI engineering, UI/UX design, dan teknologi terkini. Tips, tutorial, dan best practices.",
    url: "https://irnk.codes/blog",
  },
  alternates: {
    canonical: "https://irnk.codes/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
