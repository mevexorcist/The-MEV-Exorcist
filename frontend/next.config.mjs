/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore ESLint errors during production builds
    // Test files are not included in production bundle
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type checking is done separately in CI/CD
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
