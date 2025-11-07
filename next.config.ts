import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Force correct root to avoid Next inferring workspace root from another lockfile
  outputFileTracingRoot: path.resolve(__dirname),
  // Netlify uses its own Next.js runtime, no need for standalone output
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['yds-platform-3316f.firebasestorage.app'],
    unoptimized: true
  }
};

export default nextConfig;
