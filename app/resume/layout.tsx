import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Resume profesional Eliyanto Sarage — Full Stack Developer, UI/UX Designer, dan AI Engineer. Keahlian Next.js, React, Supabase, AI automation, performance, dan secure production web architecture.",
  openGraph: {
    title: "Resume",
    description:
      "Career dossier Eliyanto Sarage — full stack engineering, UI/UX systems, AI automation, dan production-ready web architecture.",
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
