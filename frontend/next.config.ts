import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Tambahkan ini tepat di bawah images atau output
  turbopack: {}, 
  
  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.1.109:3000", "localhost:3000"],
    },
  },
  
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;