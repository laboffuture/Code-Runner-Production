/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right'
  },
  typescript: {
    // Type errors now fail the build (the codebase is tsc-clean). Keep it this
    // way so regressions are caught at build time instead of shipping silently.
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint is still skipped during builds (lint cleanup is a separate task);
    // type-checking above is the enforced gate.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
