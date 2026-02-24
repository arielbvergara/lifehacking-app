import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchPageClient } from '@/components/search/search-page-client';

export const metadata: Metadata = {
  title: 'Search Life Hacks - LifeHackBuddy',
  description: 'Search through thousands of practical life hacks by keyword or category.',
  robots: {
    index: false,
    follow: true,
  },
};

/**
 * SearchPage Component
 * 
 * Server component wrapper for the search page.
 * All data fetching and filtering logic is handled client-side in SearchPageClient
 * to support URL-based state management and interactive filtering.
 * 
 * The SearchPageClient component handles the complete page layout including
 * Header, content area with sidebar, and results grid.
 */
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <SearchPageClient />
    </Suspense>
  );
}
