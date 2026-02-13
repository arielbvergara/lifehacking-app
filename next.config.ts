import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2llilw45t9776.cloudfront.net',
        pathname: '/public/**',
      },
    ],
  },
};

export default nextConfig;
