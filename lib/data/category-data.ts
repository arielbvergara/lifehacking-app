'use cache';

import { fetchCategories } from '@/lib/api/categories';
import { fetchTipsByCategory } from '@/lib/api/tips';
import { cacheLife } from 'next/dist/server/use-cache/cache-life';
import { TipSortField, SortDirection } from '@/lib/types/api';
import type { Category, PagedTipsResponse } from '@/lib/types/api';

/**
 * Cached Category Data Fetching Functions
 * 
 * These functions use Next.js 16 "use cache" directive for server-side caching.
 * Cache duration is 5 minutes (300 seconds) as configured in next.config.ts.
 */

/**
 * Get cached categories
 * 
 * Fetches all categories with 5-minute cache.
 * Throws error if fetch fails.
 */
export async function getCachedCategories(): Promise<Category[]> {
  'use cache';
  cacheLife('default');

  try {
    const response = await fetchCategories();
    return response.items;
  } catch (error) {
    console.error('[getCachedCategories] Error fetching categories:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    throw new Error('Failed to load categories');
  }
}

/**
 * Get cached category by ID
 * 
 * Fetches all categories and finds the one with matching ID.
 * Uses 5-minute cache. Throws error if category not found.
 */
export async function getCachedCategoryById(id: string): Promise<Category> {
  'use cache';
  cacheLife('default');

  try {
    const categories = await getCachedCategories();
    const category = categories.find((cat) => cat.id === id);
    
    if (!category) {
      throw new Error(`Category not found: ${id}`);
    }
    
    return category;
  } catch (error) {
    console.error('[getCachedCategoryById] Error fetching category:', {
      error,
      categoryId: id,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

/**
 * Get cached tips by category
 * 
 * Fetches tips for a specific category with 5-minute cache.
 * Returns empty results on error (graceful degradation).
 */
export async function getCachedTipsByCategory(
  categoryId: string,
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<PagedTipsResponse> {
  'use cache';
  cacheLife('default');

  try {
    const response = await fetchTipsByCategory(categoryId, {
      pageNumber,
      pageSize,
      orderBy: TipSortField.CreatedAt,
      sortDirection: SortDirection.Descending,
    });
    return response;
  } catch (error) {
    console.error('[getCachedTipsByCategory] Error fetching tips:', {
      error,
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
