'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { TipSummary, Category } from '@/lib/types/api';
import type { SortOption } from '@/lib/utils/sort-mappings';
import { validateSortBy, validatePage, getSortMapping } from '@/lib/utils/sort-mappings';
import { calculateActiveFilters } from '@/lib/utils/active-filters';
import { fetchTips, APIError } from '@/lib/api/tips';
import { fetchCategories } from '@/lib/api/categories';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TipCard } from '@/components/shared/tip/tip-card';
import { MobileFilterButton } from './mobile-filter-button';
import { FilterSidebar } from './filter-sidebar';
import { LoadMoreButton } from './load-more-button';

/**
 * SearchPageClient Component
 * 
 * Main client component that orchestrates all filtering, sorting, and pagination logic.
 * Manages state for tips, loading states, errors, and sidebar visibility.
 * Uses URL parameters for all filter state to enable sharing and browser navigation.
 * 
 * State Management:
 * - tips: Array of loaded tip summaries
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
 * - sortDir: Sort direction (asc | desc)
 * - page: Current page number (1-indexed)
 * 
 * Architecture:
 * - Renders Header with search bar and category filter (desktop only)
 * - Renders MobileFilterButton for mobile filter access
 * - Renders FilterSidebar with all filter controls
 * - Renders TipCard components in responsive grid layout
 * - Uses CSS-only responsive detection (Tailwind classes)
 */
export function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [tips, setTips] = useState<TipSummary[]>([]);
  const [loading, setLoading] = useState(true); // Start true for initial load
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

  // Initial load and filter changes - fetch tips when URL parameters change
  useEffect(() => {
    const loadTips = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get backend enum values from sort option
        const mapping = getSortMapping(sortBy);

        // Fetch tips with all parameters
        const response = await fetchTips({
          q: searchQuery || undefined,
          categoryId: categoryId || undefined,
          orderBy: mapping.orderBy,
          sortDirection: mapping.sortDirection,
          pageNumber: 1, // Always start at page 1 for filter changes
          pageSize: 10,
        });

        setTips(response.items);
        setTotalPages(response.metadata.totalPages);
      } catch (err) {
        setError(err instanceof APIError ? err.message : 'Failed to load tips');
      } finally {
        setLoading(false);
      }
    };

    loadTips();
  }, [searchQuery, categoryId, sortBy]);

  // Handlers
  const handleCategorySelect = (categoryId: string | null) => {
    // Create new URLSearchParams from current params
    const params = new URLSearchParams(searchParams.toString());
    
    // If categoryId is provided, set it; otherwise remove it (for "All" category)
    if (categoryId) {
      params.set('categoryId', categoryId);
    } else {
      params.delete('categoryId');
    }
    
    // Reset page to 1 when category changes
    params.delete('page');
    
    // Navigate to updated URL
    router.push(`/search?${params.toString()}`);
  };

  const handleSortChange = (newSortBy: SortOption) => {
    // Create new URLSearchParams from current params
    const params = new URLSearchParams(searchParams.toString());
    
    // Update sortBy parameter
    params.set('sortBy', newSortBy);
    
    // Reset page to 1 when sort changes
    params.delete('page');
    
    // Navigate to updated URL
    router.push(`/search?${params.toString()}`);
  };

  const handleResetFilters = () => {
    // Navigate to /search with no parameters (clears all filters)
    router.push('/search');
    // Close mobile sidebar if open
    setSidebarOpen(false);
  };

  const handleSearch = (query: string) => {
    // Create new URLSearchParams from current params
    const params = new URLSearchParams(searchParams.toString());
    
    // Update search query parameter
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    
    // Reset page to 1 when search changes
    params.delete('page');
    
    // Navigate to updated URL
    router.push(`/search?${params.toString()}`);
  };

  const handleSearchQueryRemove = () => {
    // Create new URLSearchParams from current params
    const params = new URLSearchParams(searchParams.toString());
    
    // Remove search query parameter
    params.delete('q');
    
    // Reset page to 1
    params.delete('page');
    
    // Navigate to updated URL
    router.push(`/search?${params.toString()}`);
  };

  const handleLoadMore = async () => {
    if (loadingMore || currentPage >= totalPages) return;

    setLoadingMore(true);

    try {
      // Get backend enum values from sort option
      const mapping = getSortMapping(sortBy);

      // Fetch next page of tips
      const response = await fetchTips({
        q: searchQuery || undefined,
        categoryId: categoryId || undefined,
        orderBy: mapping.orderBy,
        sortDirection: mapping.sortDirection,
        pageNumber: currentPage + 1,
        pageSize: 10,
      });

      // Append new tips to existing tips
      setTips(prev => [...prev, ...response.items]);

      // Update URL with new page number
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', (currentPage + 1).toString());
      router.push(`/search?${params.toString()}`);
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to load more tips');
    } finally {
      setLoadingMore(false);
    }
  };

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
            showCategoryFilter={true} // True on mobile (inside sidebar), false on desktop (in Header)
          />

          {/* Results Section */}
          <main className="flex-1 min-w-0">
            <div className="w-full">
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {searchQuery ? (
                  <>
                    Search results for <span className="text-primary">&ldquo;{searchQuery}&rdquo;</span>
                  </>
                ) : (
                  <>
                    Exploring <span className="text-primary">All Tips</span>
                  </>
                )}
              </h1>
              {!loading && (
                <p className="text-sm text-gray-500">
                  Showing {tips.length} {tips.length === 1 ? 'result' : 'results'}
                </p>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <p className="mt-4 text-gray-600">Loading tips...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Results Grid - Responsive layout */}
            {/* Mobile: 1 column, Desktop with sidebar: 2 columns, Large screens: 3 columns */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Empty State */}
                {tips.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">No tips found</p>
                    {hasActiveFilters && (
                      <>
                        <p className="text-gray-400 mb-4">
                          Try adjusting your filters or search criteria
                        </p>
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          Reset All Filters
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
