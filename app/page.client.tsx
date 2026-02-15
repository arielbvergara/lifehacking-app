'use client';

import { useState, useEffect, useRef } from 'react';
import { useHomeData } from '@/lib/hooks/use-home-data';
import { Header } from '@/components/layout/header';
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
 * - Scroll detection to show/hide header search bar
 */
export function HomePageClient() {
  const { categories, featuredTip, latestTips, loading: dataLoading, error, retry } = useHomeData();
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        // Show header search when hero section is scrolled past (with some buffer)
        setShowHeaderSearch(heroBottom < 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Check initial state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* Header */}
      <Header showSearchBar={showHeaderSearch} />

      {/* Main Content */}
      <main id="main-content" className="flex-grow">
        {/* Hero Section */}
        <div ref={heroRef}>
          <HeroSection />
        </div>

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
