import { generateOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const alt = "Sitemap — IRNK Codes";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage({
    title: "Sitemap",
    description: "Peta situs lengkap IRNK Codes — semua halaman, artikel, proyek, dan layanan.",
    type: "Sitemap",
  });
}
