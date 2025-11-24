/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Improve DNS resolution for API routes
  experimental: {
    // Ensure consistent DNS resolution
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;

