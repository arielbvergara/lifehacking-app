import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { generateWebsiteStructuredData, safeJsonLdStringify } from '@/lib/seo/structured-data';
import { getHomePageData } from '@/lib/data/home-data';
import { PageScrollWrapper } from './page-scroll-wrapper';
import { HeroSection } from '@/components/home/hero-section';
import { CategoryCarousel } from '@/components/home/category-carousel';
import { CategoryCarouselSkeleton } from '@/components/home/category-carousel-skeleton';
import { FeaturedTip } from '@/components/home/featured-tip';
import { LatestLifehacks } from '@/components/home/latest-lifehacks';
import { Footer } from '@/components/layout/footer';
import { SITE_URL } from '@/lib/config/site';

/**
 * Home Page Metadata
 * 
 * SEO-optimized metadata for the main landing page including
 * Open Graph tags, Twitter cards, and canonical URL.
 */
export const metadata: Metadata = {
  title: 'LifeHacking - Simple Life Hacks for Everyday Living',
  description: 'Discover simple tricks for cooking, cleaning, and living better. Browse thousands of practical life hacks organized by category.',
  keywords: ['life hacks', 'tips', 'tricks', 'home organization', 'cooking tips', 'cleaning hacks', 'productivity', 'wellness'],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'LifeHacking - Simple Life Hacks for Everyday Living',
    description: 'Discover simple tricks for cooking, cleaning, and living better.',
    type: 'website',
    url: SITE_URL,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LifeHacking - Simple Life Hacks for Everyday Living',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LifeHacking - Simple Life Hacks for Everyday Living',
    description: 'Discover simple tricks for cooking, cleaning, and living better.',
    images: ['/twitter-image.png'],
  },
};

/**
 * Home Page Component (Server Component)
 * 
 * Main landing page displaying:
 * - Hero section with search and category tags
 * - Explore categories grid
 * - Featured tip (most recent)
 * - Latest lifehacks grid
 * 
 * Uses Next.js 16 "use cache" directive for optimal performance.
 * Data is fetched on the server and cached for 5 minutes.
 * Includes structured data (JSON-LD) for enhanced SEO.
 * 
 * Note: Uses connection() to defer to request time, preventing build
 * failures when API is unavailable during static generation.
 */
export default async function Home() {
  // Defer to request time to avoid build-time API dependency
  await connection();
  
  // Fetch all data on server with caching
  const { categories, featuredTip, latestTips } = await getHomePageData();
  
  const structuredData = generateWebsiteStructuredData();

  return (
    <>
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(structuredData) }}
      />
      
      {/* Page with scroll-based header */}
      <PageScrollWrapper>
        {/* Hero Section */}
        <HeroSection />

        {/* Explore Categories Carousel */}
        <Suspense fallback={<CategoryCarouselSkeleton />}>
          <CategoryCarousel categories={categories} />
        </Suspense>

        {/* Featured Tip Section */}
        <FeaturedTip tip={featuredTip} />

        {/* Latest Lifehacks Section */}
        <LatestLifehacks tips={latestTips} />
      </PageScrollWrapper>
      
      {/* Footer */}
      <Footer />
    </>
  );
}
