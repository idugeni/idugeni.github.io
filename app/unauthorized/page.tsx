import type { Metadata } from "next";
import Link from "next/link";
import UnauthorizedClient from "./UnauthorizedClient";

export const metadata: Metadata = { 
  title: "Unauthorized",
  description: "Akses ditolak. Halaman ini memerlukan izin administrator.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnauthorizedPage() {
  return <UnauthorizedClient />;
}
