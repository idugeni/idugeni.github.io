import remarkGfm from 'remark-gfm'
import createMDX from '@next/mdx'

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.jsdelivr.net', pathname: '/**' },
      { protocol: 'https', hostname: 'nextjs.org', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
    ],
  },
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  transpilePackages: ['next-mdx-remote'],
  experimental: {
    turbo: {
      enabled: true,
    },
    serverActions: {
      enabled: true,
    },
    mdxRs: {
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      mdxType: 'gfm',
    },
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
