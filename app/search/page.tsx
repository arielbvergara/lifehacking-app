import { Suspense } from 'react';
import { connection } from 'next/server';
import { SearchPageClient } from '@/components/search/search-page-client';
import { Footer } from '@/components/layout/footer';
import { TipCard } from '@/components/shared/tip/tip-card';
import { getCachedSearchResults } from '@/lib/data/search-data';

interface SearchPageProps {
  searchParams: {
    q?: string;
    categoryId?: string;
  };
}

/**
 * SearchPage Component
 * 
 * Server component that handles search and filtering functionality.
 * - Reads q and categoryId from URL parameters
 * - Fetches tips with caching (5-minute cache)
 * - Uses connection() to defer rendering to request time
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Defer to request time to avoid build-time API dependency
  await connection();

  // Read URL parameters
  const { q: searchQuery, categoryId } = await searchParams;

  // Fetch search results with caching
  const response = await getCachedSearchResults(
    searchQuery,
    categoryId,
    1,
    20
  );

  const { items: tips, metadata: pagination } = response;

  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="h-20 bg-white border-b border-gray-100" />}>
        <SearchPageClient />
      </Suspense>
      
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Search Tips'}
          </h1>
          <p className="text-gray-600">
            {pagination.totalItems} {pagination.totalItems === 1 ? 'tip' : 'tips'} found
          </p>
        </div>

        {/* Tips Grid */}
        {tips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No tips found</p>
            {(searchQuery || categoryId) && (
              <p className="text-gray-500 mt-2">
                Try adjusting your search or filter criteria
              </p>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
