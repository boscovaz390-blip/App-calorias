import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    domains: [],
  },
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
