import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Reset password akun IRNK Codes. Kirim permintaan reset untuk mendapatkan link pemulihan password melalui email yang terdaftar.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    description: "Reset password akun IRNK Codes melalui email yang terdaftar.",
    url: "https://irnk.codes/reset-password",
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
