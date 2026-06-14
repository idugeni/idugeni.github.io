import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Koleksi proyek unggulan Eliyanto Sarage — aplikasi web, mobile, dan AI yang dibangun dengan teknologi modern seperti Next.js, React, dan Python.",
  openGraph: {
    description:
      "Koleksi proyek unggulan — aplikasi web, mobile, dan AI yang dibangun dengan teknologi modern seperti Next.js, React, dan Python.",
    url: "https://irnk.codes/projects",
  },
  alternates: {
    canonical: "https://irnk.codes/projects",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
