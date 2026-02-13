'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useHomeData } from '@/lib/hooks/use-home-data';
import { HomeHeader } from '@/components/layout/home-header';
import { HeroSection } from '@/components/home/hero-section';
import { ExploreCategories } from '@/components/home/explore-categories';
import { FeaturedTip } from '@/components/home/featured-tip';
import { LatestLifehacks } from '@/components/home/latest-lifehacks';
import { HomeFooter } from '@/components/home/home-footer';

/**
 * Home Page Client Component
 * 
 * Handles client-side interactivity including:
 * - Authentication state
 * - Data fetching with loading/error states
 * - User interactions
 */
export function HomePageClient() {
  const { user, loading: authLoading } = useAuth();
  const { categories, featuredTip, latestTips, loading: dataLoading, error, retry } = useHomeData();

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center" role="status" aria-live="polite">
          <div 
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"
            aria-hidden="true"
          ></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* Header */}
      <HomeHeader user={user} />

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
      <HomeFooter />
    </div>
  );
}
