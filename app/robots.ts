import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config/site';

/**
 * robots.txt generation
 *
 * Allows all public pages to be crawled and indexed.
 * Blocks authenticated/admin routes and API routes.
 */
export default function robots(): MetadataRoute.Robots {
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
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
