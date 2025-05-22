import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint checks during Vercel builds
    ignoreDuringBuilds: isVercel,
  },
  typescript: {
    // Skip TypeScript type checking errors during Vercel builds
    ignoreBuildErrors: isVercel,
  },
};

export default nextConfig;
