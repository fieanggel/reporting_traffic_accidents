import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', 
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.1.109:3000", "localhost:3000"],
    },
  },
  // Tambahkan ini di tingkat paling luar (bukan di dalam experimental)
  // Ini trik untuk Next.js 16 agar tidak komplain soal Turbopack
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;