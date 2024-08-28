import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://idugeni.vercel.app';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const hostname = request.headers.get('host') || '';

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Content-Security-Policy', "default-src 'self'; img-src 'self' https:; script-src 'self'; style-src 'self' 'unsafe-inline';");
  response.headers.set('Permissions-Policy', 'geolocation=(self), microphone=()');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Cache-Control', 'no-store');

  if (hostname.includes('github.io')) {
    const newUrl = new URL(request.url);
    newUrl.hostname = new URL(siteUrl).hostname;
    return NextResponse.redirect(newUrl);
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204 });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
