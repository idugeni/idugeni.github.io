import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Arsip visual karya desain dan proyek Eliyanto Sarage — screenshot aplikasi, UI mockup, dan dokumentasi visual dari berbagai proyek digital premium.",
  openGraph: {
    title: "Gallery",
    description:
      "Arsip visual karya desain dan proyek — screenshot aplikasi, UI mockup, dan dokumentasi visual dari berbagai proyek digital premium.",
    url: "https://irnk.codes/gallery",
  },
  alternates: {
    canonical: "https://irnk.codes/gallery",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
