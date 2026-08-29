import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**.public.blob.vercel-storage.com' }] },
  serverExternalPackages: ['payload', '@payloadcms/db-postgres', 'drizzle-kit', 'esbuild'],
  turbopack: { root: import.meta.dirname },
}
export default nextConfig
