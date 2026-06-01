import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Kebijakan privasi IRNK Codes — informasi tentang bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi pengunjung situs web kami.",
  openGraph: {
    title: "Privacy Policy",
    description:
      "Kebijakan privasi — informasi tentang bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi pengunjung situs web kami.",
    url: "https://irnk.codes/privacy",
  },
  alternates: {
    canonical: "https://irnk.codes/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
