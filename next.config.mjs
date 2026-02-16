/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      // Може да добавите и други домейни за изображения тук, ако е необходимо
    ],
  },
  // Remove i18n configuration as it's not supported in App Router
  // Remove experimental.missingSuspenseWithCSRBailout as it's not a valid option
}

export default nextConfig
