import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Wajib untuk Docker + Nginx
  output: 'export', 
  
  // 2. Agar gambar tidak error saat export statis
  images: {
    unoptimized: true,
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.1.109:3000", "localhost:3000"],
    },
    // 3. Matikan bentrok Turbopack vs Webpack
    turbopack: {} 
  },
  
  // 4. Tetap pertahankan fallback fs jika memang dibutuhkan library-mu
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;