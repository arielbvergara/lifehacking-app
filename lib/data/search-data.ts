'use cache';

import { fetchCategories } from '@/lib/api/categories';
import { fetchTips } from '@/lib/api/tips';
import { cacheLife } from 'next/dist/server/use-cache/cache-life';
import type { Category, PagedTipsResponse } from '@/lib/types/api';

/**
 * Cached Search Data Fetching Functions
 * 
 * These functions use Next.js 16 "use cache" directive for server-side caching.
 * Cache duration is 5 minutes (300 seconds) as configured in next.config.ts.
 */

/**
 * Get cached categories for search page
 * 
 * Fetches all categories with 5-minute cache.
 * Throws error if fetch fails.
 */
export async function getCachedCategoriesForSearch(): Promise<Category[]> {
  'use cache';
  cacheLife('default');

  try {
    const response = await fetchCategories();
    return response.items;
  } catch (error) {
    console.error('[getCachedCategoriesForSearch] Error fetching categories:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    throw new Error('Failed to load categories');
  }
}

/**
 * Get cached search results
 * 
 * Fetches tips with optional search query and category filter.
 * Cache keys are generated based on parameters - different queries have separate cache entries.
 * Returns empty results on error (graceful degradation).
 * 
 * @param searchQuery - Optional search term
 * @param categoryId - Optional category UUID
 * @param pageNumber - Page number (default: 1)
 * @param pageSize - Results per page (default: 20)
 */
export async function getCachedSearchResults(
  searchQuery?: string,
  categoryId?: string,
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<PagedTipsResponse> {
  'use cache';
  cacheLife('default');

  try {
    const response = await fetchTips({
      q: searchQuery,
      categoryId: categoryId,
      pageNumber,
      pageSize,
    });
    return response;
  } catch (error) {
    console.error('[getCachedSearchResults] Error fetching search results:', {
      error,
      searchQuery,
      categoryId,
      pageNumber,
      pageSize,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    // Return empty results for graceful degradation
    return {
      items: [],
      metadata: {
        totalItems: 0,
        pageNumber,
        pageSize,
        totalPages: 0,
      },
    };
  }
}
