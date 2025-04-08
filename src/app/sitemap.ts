import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://oldsoul.id';
  // Gunakan tanggal tetap untuk lastModified agar tidak berubah setiap build
  // Format: YYYY-MM-DD
  
  // Definisikan rute statis dengan prioritas yang tepat
  const staticRoutes = [
    { route: '', lastMod: new Date('2025-04-09'), priority: 1.0 },
    { route: 'about', lastMod: new Date('2025-04-09'), priority: 0.8 },
    { route: 'projects', lastMod: new Date('2025-04-09'), priority: 0.9 },
    { route: 'contact', lastMod: new Date('2025-04-09'), priority: 0.7 },
    { route: 'resume', lastMod: new Date('2025-04-09'), priority: 0.8 }
  ].map(({ route, lastMod, priority }) => ({
    url: `${baseUrl}${route ? `/${route}` : ''}`,
    lastModified: lastMod,
    changeFrequency: 'weekly' as const,
    priority: priority,
  }));

  // Di sini Anda dapat menambahkan rute dinamis jika diperlukan
  // Misalnya, jika Anda memiliki halaman blog atau proyek dinamis
  // const dynamicRoutes = [...]
  
  return [
    ...staticRoutes,
    // ...dynamicRoutes, // Uncomment jika Anda menambahkan rute dinamis
  ];
}