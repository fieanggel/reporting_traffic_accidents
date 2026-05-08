/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // <-- WAJIB untuk ECS Fargate
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;