import type { NextConfig } from "next";

const backendUrl = process.env.API_URL || 'http://localhost:8080';

const { hostname: backendHostname, protocol: backendProtocol, port: backendPort } = new URL(backendUrl);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: backendProtocol.replace(':', '') as 'http' | 'https',
        hostname: backendHostname,
        port: backendPort,
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Image proxy only — API routes now go through /api/proxy route handler
        source: '/images/:filename*',
        destination: `${backendUrl}/post/image/:filename*`,
      },
    ]
  },
};

export default nextConfig;
