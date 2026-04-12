import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/:path*',
      },
      {
        source: '/images/:filename*',
        destination: 'http://localhost:8080/post/image/:filename*',
      },
    ]
  },
};

export default nextConfig;
