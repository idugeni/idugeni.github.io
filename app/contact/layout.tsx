import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Hubungi Eliyanto Sarage untuk kolaborasi proyek, konsultasi teknis, atau pertanyaan. Respons dalam 24 jam.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
