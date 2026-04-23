import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Gunakan konfigurasi ini untuk mengizinkan akses dari IP HP/Laptop lain
    serverActions: {
      allowedOrigins: ["192.168.1.109:3000", "localhost:3000"],
    },
  } as any, // 'as any' biar TypeScript nggak rewel kalau versinya belum cocok
  
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;