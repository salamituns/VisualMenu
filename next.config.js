/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'zuajrsvhimnoefuzklry.supabase.co',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // Reduce cache warnings
    config.infrastructureLogging = {
      level: 'error',
    };
    
    return config;
  },
}

module.exports = nextConfig 