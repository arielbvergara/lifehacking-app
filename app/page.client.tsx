'use client';

import { useHomeData } from '@/lib/hooks/use-home-data';
import { HomeHeader } from '@/components/layout/home-header';
import { HeroSection } from '@/components/home/hero-section';
import { ExploreCategories } from '@/components/home/explore-categories';
import { FeaturedTip } from '@/components/home/featured-tip';
import { LatestLifehacks } from '@/components/home/latest-lifehacks';
import { Footer } from '@/components/layout/footer';

/**
 * Home Page Client Component
 * 
 * Handles client-side interactivity including:
 * - Data fetching with loading/error states
 * - User interactions
 */
export function HomePageClient() {
  const { categories, featuredTip, latestTips, loading: dataLoading, error, retry } = useHomeData();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* Header */}
      <HomeHeader />

      {/* Main Content */}
      <main id="main-content" className="flex-grow">
        {/* Hero Section */}
        <HeroSection />

        {/* Explore Categories Section */}
        <ExploreCategories
          categories={categories}
          loading={dataLoading}
          error={error}
          onRetry={retry}
        />

        {/* Featured Tip Section */}
        <FeaturedTip
          tip={featuredTip}
          loading={dataLoading}
          error={error}
          onRetry={retry}
        />

        {/* Latest Lifehacks Section */}
        <LatestLifehacks
          tips={latestTips}
          loading={dataLoading}
          error={error}
          onRetry={retry}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
