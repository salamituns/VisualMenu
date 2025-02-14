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
    domains: [
      'zuajrsvhimnoefuzklry.supabase.co',
      'restaurantocr.cognitiveservices.azure.com'
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // Reduce cache warnings
    config.infrastructureLogging = {
      level: 'error',
    };
    
    return config;
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_AZURE_FORM_ENDPOINT: process.env.NEXT_PUBLIC_AZURE_FORM_ENDPOINT,
    NEXT_PUBLIC_AZURE_FORM_KEY: process.env.NEXT_PUBLIC_AZURE_FORM_KEY,
    NEXT_PUBLIC_AZURE_CV_KEY: process.env.NEXT_PUBLIC_AZURE_CV_KEY,
    NEXT_PUBLIC_AZURE_CV_ENDPOINT: process.env.NEXT_PUBLIC_AZURE_CV_ENDPOINT,
  },
}

module.exports = nextConfig 