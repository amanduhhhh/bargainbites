import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js', 'canvas']
  }
};

export default nextConfig;
