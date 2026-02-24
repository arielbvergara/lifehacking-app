import type { MetadataRoute } from 'next';

/**
 * robots.txt generation
 *
 * Allows all public pages to be crawled and indexed.
 * Blocks authenticated/admin routes and API routes.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://lifehackbuddy.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/favorites/',
          '/login',
          '/signup',
          '/forgot-password',
          '/welcome',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
