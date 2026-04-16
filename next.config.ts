import type { NextConfig } from "next";

const backendUrl = process.env.API_URL || 'http://localhost:8080';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
      {
        source: '/images/:filename*',
        destination: `${backendUrl}/post/image/:filename*`,
      },
    ]
  },
};

export default nextConfig;
