'use client';

/**
 * FavoritesPageClient Component
 * 
 * Main client component for the favorites page that mirrors the search page structure.
 * Uses the same filtering, sorting, and pagination logic but fetches from /api/me/favorites.
 * 
 * State Management:
 * - tips: Array of favorite tip summaries
 * - loading: Boolean for initial load state
 * - loadingMore: Boolean for pagination load state
 * - error: Error message string or null
 * - totalPages: Total pages from API metadata
 * - sidebarOpen: Boolean for mobile sidebar visibility
 * 
 * URL Parameters:
 * - q: Search query string
 * - categoryId: Selected category UUID
 * - sortBy: Sort option (newest | oldest | alphabetical)
 * - page: Current page number (1-indexed)
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import type { TipSummary, Category } from '@/lib/types/api';
import type { SortOption } from '@/lib/utils/sort-mappings';
import { validateSortBy, validatePage, getSortMapping } from '@/lib/utils/sort-mappings';
import { calculateActiveFilters } from '@/lib/utils/active-filters';
import * as favoritesApi from '@/lib/api/favorites';
import { fetchCategories } from '@/lib/api/categories';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TipCard } from '@/components/shared/tip/tip-card';
import { MobileFilterButton } from '@/components/search/mobile-filter-button';
import { FilterSidebar } from '@/components/search/filter-sidebar';
import { LoadMoreButton } from '@/components/search/load-more-button';
import { ANONYMOUS_MAX_FAVORITES } from '@/lib/constants/favorites';

export function FavoritesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, idToken, loading: authLoading } = useAuth();

  // State management
  const [tips, setTips] = useState<TipSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Read and validate URL parameters
  const searchQuery = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || null;
  const sortBy = validateSortBy(searchParams.get('sortBy'));
  const currentPage = validatePage(searchParams.get('page'));

  // Calculate active filter count for mobile button badge
  const activeFilterCount = calculateActiveFilters(searchParams);
  const hasActiveFilters = activeFilterCount > 0;

  // Get selected category name from categories array
  const selectedCategoryName = categoryId 
    ? categories.find(cat => cat.id === categoryId)?.name || null
    : null;

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        setCategories(response.items);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();
  }, []);

  // Initial load and filter changes - fetch favorites when URL parameters change
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      setError(null);

      try {
        if (user && idToken) {
          // Authenticated user: fetch from server with filters
          const mapping = getSortMapping(sortBy);
          
          // Map enum values to API string values
          let orderBy: 'Title' | 'CreatedAt' | 'UpdatedAt' = 'CreatedAt';
          if (mapping.orderBy === 2) { // TipSortField.Title
            orderBy = 'Title';
          } else if (mapping.orderBy === 1) { // TipSortField.UpdatedAt
            orderBy = 'UpdatedAt';
          } else { // TipSortField.CreatedAt (0)
            orderBy = 'CreatedAt';
          }
          
          const sortDirection: 'Ascending' | 'Descending' = 
            mapping.sortDirection === 0 ? 'Ascending' : 'Descending';

          // Fetch favorites with all parameters
          const response = await favoritesApi.getFavorites(
            {
              q: searchQuery || undefined,
              categoryId: categoryId || undefined,
              orderBy,
              sortDirection,
              pageNumber: 1, // Always start at page 1 for filter changes
              pageSize: 10,
            },
            idToken
          );

          setTips(response.items);
          setTotalPages(response.totalPages);
        } else {
          // Anonymous user: load from localStorage (no filtering/sorting)
          const { localStorageManager } = await import('@/lib/storage/favorites-storage');
          const localFavoriteIds = localStorageManager.getFavorites();
          
          if (localFavoriteIds.length === 0) {
            setTips([]);
            setTotalPages(1);
          } else {
            // Limit to first 5 favorites for anonymous users
            const limitedIds = localFavoriteIds.slice(0, ANONYMOUS_MAX_FAVORITES);
            
            // Fetch tip details for anonymous favorites
            const tipPromises = limitedIds.map(async (tipId) => {
              try {
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/Tip/${tipId}`
                );
                if (response.ok) {
                  return await response.json();
                }
                return null;
              } catch (err) {
                console.error(`Failed to fetch tip ${tipId}:`, err);
                return null;
              }
            });
            
            const tips = await Promise.all(tipPromises);
            const validTips = tips.filter((tip): tip is TipSummary => tip !== null);
            
            setTips(validTips);
            setTotalPages(1); // No pagination for anonymous users
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user, idToken, searchQuery, categoryId, sortBy]);

  // Handlers
  const handleCategorySelect = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (categoryId) {
      params.set('categoryId', categoryId);
    } else {
      params.delete('categoryId');
    }
    
    params.delete('page');
    router.push(`/favorites?${params.toString()}`);
  };

  const handleSortChange = (newSortBy: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', newSortBy);
    params.delete('page');
    router.push(`/favorites?${params.toString()}`);
  };

  const handleResetFilters = () => {
    router.push('/favorites');
    setSidebarOpen(false);
  };

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    
    params.delete('page');
    router.push(`/favorites?${params.toString()}`);
  };

  const handleSearchQueryRemove = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('page');
    router.push(`/favorites?${params.toString()}`);
  };

  const handleLoadMore = async () => {
    if (loadingMore || currentPage >= totalPages || !idToken) return;

    setLoadingMore(true);

    try {
      const mapping = getSortMapping(sortBy);
      
      let orderBy: 'Title' | 'CreatedAt' | 'UpdatedAt' = 'CreatedAt';
      if (mapping.orderBy === 2) {
        orderBy = 'Title';
      } else if (mapping.orderBy === 1) {
        orderBy = 'UpdatedAt';
      } else {
        orderBy = 'CreatedAt';
      }
      
      const sortDirection: 'Ascending' | 'Descending' = 
        mapping.sortDirection === 0 ? 'Ascending' : 'Descending';

      // Fetch next page of favorites
      const response = await favoritesApi.getFavorites(
        {
          q: searchQuery || undefined,
          categoryId: categoryId || undefined,
          orderBy,
          sortDirection,
          pageNumber: currentPage + 1,
          pageSize: 10,
        },
        idToken
      );

      // Append new tips to existing tips
      setTips(prev => [...prev, ...response.items]);

      // Update URL with new page number
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', (currentPage + 1).toString());
      router.push(`/favorites?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more favorites');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleBrowseTips = () => {
    router.push('/');
  };

  // Wait for auth to load to prevent hydration mismatch
  // Server doesn't know auth state, so we wait for client to determine it
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Anonymous user: Simple layout without filters
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showSearchBar={false} showCategoryFilter={false} />
        
        <div className="flex-1 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600 mt-2">
                {tips.length} {tips.length === 1 ? 'tip' : 'tips'} saved locally
              </p>
            </div>

            {/* Upgrade Message */}
            {tips.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">
                      Sign up for unlimited favorites
                    </h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Anonymous users can save up to {ANONYMOUS_MAX_FAVORITES} favorites. 
                      Create an account to save unlimited favorites, access them from any device, 
                      and use search and filter features.
                    </p>
                    <button
                      onClick={() => router.push('/login')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Sign Up / Log In
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <p className="mt-4 text-gray-600">Loading favorites...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && tips.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4" aria-hidden="true">📌</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  No favorites yet
                </h2>
                <p className="text-gray-600 mb-6">
                  Start exploring tips and save your favorites here!
                </p>
                <button
                  onClick={handleBrowseTips}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Browse Tips
                </button>
              </div>
            )}

            {/* Favorites Grid */}
            {!loading && !error && tips.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tips.map((tip) => (
                  <TipCard key={tip.id} tip={tip} />
                ))}
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Authenticated user: Full layout with filters and sidebar
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with search bar and category filter (desktop only) */}
      <Header
        showSearchBar={true}
        showCategoryFilter={true}
        selectedCategoryId={categoryId}
        onCategorySelect={handleCategorySelect}
        onSearch={handleSearch}
      />

      {/* Mobile Filter Button - Only visible on mobile (<768px) */}
      <div className="md:hidden">
        <MobileFilterButton
          onClick={() => setSidebarOpen(true)}
          activeFilterCount={activeFilterCount}
          isOpen={sidebarOpen}
        />
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex bg-gray-50">
        <div className="w-full max-w-7xl mx-auto flex items-start gap-6 px-4 md:px-8 py-8">
          {/* Filter Sidebar - Always visible on desktop, collapsible on mobile */}
          <FilterSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            selectedCategoryId={categoryId}
            selectedCategoryName={selectedCategoryName}
            onCategorySelect={handleCategorySelect}
            searchQuery={searchQuery}
            onSearchQueryRemove={handleSearchQueryRemove}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            showCategoryFilter={true}
          />

          {/* Results Section */}
          <main className="flex-1 min-w-0">
            <div className="w-full">
              {/* Page Title */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  My <span className="text-primary">Favorites</span>
                </h1>
                {!loading && (
                  <p className="text-sm text-gray-500">
                    Showing {tips.length} {tips.length === 1 ? 'favorite' : 'favorites'}
                  </p>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  <p className="mt-4 text-gray-600">Loading favorites...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Results Grid */}
              {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Empty State */}
                  {tips.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <div className="text-6xl mb-4" aria-hidden="true">📌</div>
                      <p className="text-gray-500 text-lg mb-4">
                        {hasActiveFilters ? 'No favorites match your filters' : 'No favorites yet'}
                      </p>
                      {hasActiveFilters ? (
                        <>
                          <p className="text-gray-400 mb-4">
                            Try adjusting your filters or search criteria
                          </p>
                          <button
                            onClick={handleResetFilters}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Reset All Filters
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-400 mb-4">
                            Start exploring tips and save your favorites here!
                          </p>
                          <button
                            onClick={handleBrowseTips}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Browse Tips
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Tip Cards */}
                  {tips.map((tip) => (
                    <TipCard key={tip.id} tip={tip} />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {!loading && !error && tips.length > 0 && currentPage < totalPages && (
                <LoadMoreButton
                  onClick={handleLoadMore}
                  loading={loadingMore}
                  disabled={loadingMore || currentPage >= totalPages}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
