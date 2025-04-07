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
    return []
  },
};

export default nextConfig
