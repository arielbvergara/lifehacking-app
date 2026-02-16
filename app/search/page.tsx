'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TipCard } from '@/components/shared/tip/tip-card';
import { fetchTips } from '@/lib/api/tips';
import type { TipSummary, PaginationMetadata } from '@/lib/types/api';

/**
 * SearchPageContent Component
 * 
 * Inner component that uses useSearchParams (must be wrapped in Suspense)
 */
function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Read URL parameters
  const searchQuery = searchParams.get('q');
  const categoryId = searchParams.get('categoryId');
  
  // State management
  const [tips, setTips] = useState<TipSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);

  // Fetch tips when URL parameters change
  useEffect(() => {
    const loadTips = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchTips({
          q: searchQuery || undefined,
          categoryId: categoryId || undefined,
          pageSize: 20,
        });
        
        setTips(response.items);
        setPagination(response.metadata);
      } catch (err) {
        console.error('Failed to load tips in SearchPage:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          context: {
            searchQuery,
            categoryId,
            pageSize: 20,
          },
          timestamp: new Date().toISOString(),
        });
        setError(err instanceof Error ? err.message : 'Failed to load tips');
      } finally {
        setLoading(false);
      }
    };
    
    loadTips();
  }, [searchQuery, categoryId]);

  // Handle category selection - update URL with categoryId
  const handleCategorySelect = (newCategoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newCategoryId) {
      params.set('categoryId', newCategoryId);
    } else {
      // Remove categoryId when "All" is selected
      params.delete('categoryId');
    }
    
    router.push(`/search?${params.toString()}`);
  };

  // Handle search submission - update URL with q parameter
  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    
    router.push(`/search?${params.toString()}`);
  };

  // Handle retry on error
  const handleRetry = () => {
    // Trigger re-fetch by updating a dummy state
    setError(null);
    setLoading(true);
    
    // Re-run the effect by forcing a re-render
    const loadTips = async () => {
      try {
        const response = await fetchTips({
          q: searchQuery || undefined,
          categoryId: categoryId || undefined,
          pageSize: 20,
        });
        
        setTips(response.items);
        setPagination(response.metadata);
      } catch (err) {
        console.error('Failed to load tips in SearchPage (retry):', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          context: {
            searchQuery,
            categoryId,
            pageSize: 20,
            isRetry: true,
          },
          timestamp: new Date().toISOString(),
        });
        setError(err instanceof Error ? err.message : 'Failed to load tips');
      } finally {
        setLoading(false);
      }
    };
    
    loadTips();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        showSearchBar={true}
        showCategoryFilter={true}
        selectedCategoryId={categoryId}
        onCategorySelect={handleCategorySelect}
        onSearch={handleSearch}
      />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Search Tips'}
          </h1>
          {!loading && pagination && (
            <p className="text-gray-600">
              {pagination.totalItems} {pagination.totalItems === 1 ? 'tip' : 'tips'} found
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <TipCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Success State - Tips Grid */}
        {!loading && !error && tips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tips.length === 0 && (
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

/**
 * SearchPage Component
 * 
 * Main search page that orchestrates search and filtering functionality.
 * - Reads q and categoryId from URL parameters
 * - Fetches tips based on URL parameters
 * - Updates URL when category or search changes
 * - Preserves URL parameters when updating
 * - Supports browser back/forward navigation
 */
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}

/**
 * SearchPageSkeleton Component
 * 
 * Loading skeleton for the entire search page while Suspense is loading
 */
function SearchPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full bg-white border-b border-gray-100 h-20 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <TipCardSkeleton key={index} />
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

/**
 * TipCardSkeleton Component
 * 
 * Loading skeleton for TipCard while fetching data
 */
function TipCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-5">
        <div className="w-20 h-6 bg-gray-200 rounded-full mb-3"></div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded mb-1"></div>
        <div className="h-4 bg-gray-200 rounded mb-4 w-5/6"></div>
        <div className="flex items-center justify-between">
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
