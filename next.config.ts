import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Cache Components for Next.js 16
  cacheComponents: true,
  
  // Define custom cache life profiles
  cacheLife: {
    // 5-minute cache for home page data
    home: {
      stale: 300,      // 5 minutes - serve stale while revalidating
      revalidate: 300, // 5 minutes - revalidate in background
      expire: 600,     // 10 minutes - maximum age before forced refresh
    },
    // 5-minute cache for search/category data
    search: {
      stale: 300,
      revalidate: 300,
      expire: 600,
    },
  },
  
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
