import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update Password",
  description:
    "Perbarui password akun IRNK Codes. Buat password baru yang aman untuk melindungi akses ke dashboard administrasi Anda.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Update Password",
    description: "Perbarui password akun IRNK Codes dengan password baru yang aman.",
    url: "https://irnk.codes/update-password",
  },
};

export default function UpdatePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
