/**
 * Server-side data fetching functions for search page
 * 
 * These functions use Next.js 16's "use cache" directive for optimal performance.
 * Data is cached on the server with a 5-minute expiration policy.
 */

'use cache';

import { fetchCategories } from '@/lib/api/categories';
import { fetchTips } from '@/lib/api/tips';
import type { Category, PagedTipsResponse } from '@/lib/types/api';

/**
 * Fetch and cache categories for search page
 * 
 * @returns Array of categories
 * @throws Error if fetch fails
 */
export async function getCachedCategoriesForSearch(): Promise<Category[]> {
  try {
    const response = await fetchCategories();
    return response.items;
  } catch (error) {
    console.error('[getCachedCategoriesForSearch] Error fetching categories:', error);
    throw new Error('Failed to load categories');
  }
}

/**
 * Fetch tips with optional search query and category filter
 * 
 * Note: This function is cached, but cache keys are generated based on parameters.
 * Different search queries and category filters will have separate cache entries.
 * 
 * @param searchQuery - Optional search term
 * @param categoryId - Optional category UUID
 * @param pageNumber - Page number (default: 1)
 * @param pageSize - Results per page (default: 20)
 * @returns Paged tips response
 * @throws Error if fetch fails
 */
export async function getCachedSearchResults(
  searchQuery?: string,
  categoryId?: string,
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<PagedTipsResponse> {
  try {
    const response = await fetchTips({
      q: searchQuery,
      categoryId: categoryId,
      pageNumber,
      pageSize,
    });
    return response;
  } catch (error) {
    console.error('[getCachedSearchResults] Error fetching search results:', error);
    throw new Error('Failed to load search results');
  }
}
