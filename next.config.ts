import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable TypeScript and ESLint checks in production builds
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
