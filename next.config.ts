/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oldsoul.id',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        destination: 'https://blog.oldsoul.id/:path*',
        permanent: true,
        has: [
          {
            type: 'header',
            key: 'host',
            value: 'oldsoul.id'
          }
        ],
        basePath: false,
      },
      {
        source: '/about',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/projects',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/resume',
        destination: '/resume',
        permanent: true,
      },
      {
        source: '/robots.txt',
        destination: '/robots.txt',
        permanent: true,
      },
      {
        source: '/sitemap.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/favicon.ico',
        destination: '/favicon.ico',
        permanent: true,
      },
      {
        source: '/api/:path*',
        destination: '/api/:path*',
        permanent: true,
      },
      {
        source: '/public/:path*',
        destination: '/public/:path*',
        permanent: true,
      },
      {
        source: '/404',
        destination: '/404',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
