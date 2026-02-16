import type { Metadata } from 'next';
import { generateWebsiteStructuredData } from '@/lib/seo/structured-data';
import { getHomePageData } from '@/lib/data/home-data';
import { PageScrollWrapper } from './page-scroll-wrapper';
import { HeroSection } from '@/components/home/hero-section';
import { ExploreCategories } from '@/components/home/explore-categories';
import { FeaturedTip } from '@/components/home/featured-tip';
import { LatestLifehacks } from '@/components/home/latest-lifehacks';
import { Footer } from '@/components/layout/footer';

/**
 * Home Page Metadata
 * 
 * SEO-optimized metadata for the main landing page including
 * Open Graph tags, Twitter cards, and canonical URL.
 */
export const metadata: Metadata = {
  title: 'LifeHackBuddy - Simple Life Hacks for Everyday Living',
  description: 'Discover simple tricks for cooking, cleaning, and living better. Browse thousands of practical life hacks organized by category.',
  keywords: ['life hacks', 'tips', 'tricks', 'home organization', 'cooking tips', 'cleaning hacks', 'productivity', 'wellness'],
  alternates: {
    canonical: 'https://lifehackbuddy.com',
  },
  openGraph: {
    title: 'LifeHackBuddy - Simple Life Hacks for Everyday Living',
    description: 'Discover simple tricks for cooking, cleaning, and living better.',
    type: 'website',
    url: 'https://lifehackbuddy.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LifeHackBuddy - Simple Life Hacks for Everyday Living',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LifeHackBuddy - Simple Life Hacks for Everyday Living',
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
 */
export default async function Home() {
  // Fetch all data on server with caching
  const { categories, featuredTip, latestTips } = await getHomePageData();
  
  const structuredData = generateWebsiteStructuredData();

  return (
    <>
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Page with scroll-based header */}
      <PageScrollWrapper>
        {/* Hero Section */}
        <HeroSection />

        {/* Explore Categories Section */}
        <ExploreCategories categories={categories} />

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
