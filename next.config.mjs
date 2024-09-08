import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  // Configure Next.js image domains, if needed
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nextjs.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },

  // Strict mode for React
  reactStrictMode: true,

  // Browser source maps disabled for production
  productionBrowserSourceMaps: false,

  // Optional ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optionally, add more config as needed
  output: 'standalone',
}

// Configure MDX with optional plugins (you can add more plugins here if necessary)
const withMDX = createMDX({
  // Add MDX or markdown plugins here, if needed
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)
