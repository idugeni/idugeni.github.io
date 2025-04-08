import { NextResponse } from 'next/server'

export const runtime = 'edge'

async function generateSiteMap() {
  const baseUrl = 'https://oldsoul.id'

  const staticPaths = [
    '',
    'about',
    'projects',
    'contact',
    'resume'
  ]

  // Jika nanti ingin ambil project / konten dinamis, bisa tambahkan di sini

  const urls = staticPaths.map(path => {
    return `<url>
      <loc>${baseUrl}/${path}</loc>
      <changefreq>weekly</changefreq>
      <priority>${path === '' ? '1.0' : '0.8'}</priority>
    </url>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

export async function GET() {
  const body = await generateSiteMap()
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8'
    }
  })
}