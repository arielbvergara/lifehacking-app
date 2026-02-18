import { Suspense } from 'react';
import { FavoritesPageClient } from '@/components/favorites/favorites-page-client';

/**
 * FavoritesPage Component
 * 
 * Server component wrapper for the favorites page.
 * All data fetching and filtering logic is handled client-side in FavoritesPageClient
 * to support URL-based state management and interactive filtering.
 * 
 * The FavoritesPageClient component handles the complete page layout including
 * Header, content area with sidebar, and results grid - matching the search page structure.
 */
export default function FavoritesPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <FavoritesPageClient />
    </Suspense>
  );
}
