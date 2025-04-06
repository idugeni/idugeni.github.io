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
    domains: ['oldsoul.id'],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
