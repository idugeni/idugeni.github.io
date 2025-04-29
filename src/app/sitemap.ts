import { MetadataRoute } from 'next';

/**
 * Fungsi pembuat sitemap statis untuk SEO website.
 * @returns {MetadataRoute.Sitemap} Array konfigurasi sitemap.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://oldsoul.id';
  const lastMod = new Date('2025-04-09'); // Definisikan tanggal sekali saja
  // Gunakan tanggal tetap untuk lastModified agar tidak berubah setiap build
  // Format: YYYY-MM-DD
  
  // Definisikan rute statis dengan prioritas yang tepat
  const staticRoutes = [
    { route: '', priority: 1.0 },
    { route: 'about', priority: 0.8 },
    { route: 'projects', priority: 0.9 },
    { route: 'contact', priority: 0.7 },
    { route: 'resume', priority: 0.8 }
  ].map(({ route, priority }) => ({
    url: `${baseUrl}${route ? `/${route}` : ''}`,
    lastModified: lastMod,
    changeFrequency: 'weekly' as const,
    priority,
  }));

  // Di sini Anda dapat menambahkan rute dinamis jika diperlukan
  // Misalnya, jika Anda memiliki halaman blog atau proyek dinamis
  // const dynamicRoutes = [...]
  
  return [
    ...staticRoutes,
    // ...dynamicRoutes, // Uncomment jika Anda menambahkan rute dinamis
  ];
}