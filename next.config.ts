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
  
  /**
   * Security Headers
   * 
   * Purpose: Protect against common web vulnerabilities
   * 
   * Headers Implemented:
   * - X-Frame-Options: Prevents clickjacking attacks
   * - X-Content-Type-Options: Prevents MIME type sniffing
   * - Referrer-Policy: Controls referrer information
   * - X-XSS-Protection: Legacy XSS protection (for older browsers)
   * - Permissions-Policy: Restricts browser features
   * 
   * Note: CSP not included yet - requires careful configuration with inline styles
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevents site from being embedded in iframes (clickjacking protection)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevents browsers from MIME-sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Controls referrer information
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // Legacy XSS protection for older browsers
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Disable unnecessary browser features
          },
        ],
      },
    ];
  },
};

export default nextConfig;
