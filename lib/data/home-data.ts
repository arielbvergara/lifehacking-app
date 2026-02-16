/**
 * Server-side data fetching functions for home page
 * 
 * These functions use Next.js 16's "use cache" directive for optimal performance.
 * Data is cached on the server with a 5-minute expiration policy.
 */

'use cache';

import { fetchCategories } from '@/lib/api/categories';
import { fetchTips } from '@/lib/api/tips';
import type { Category, TipSummary } from '@/lib/types/api';

/**
 * Fetch and cache categories for home page
 * 
 * @returns Array of categories
 * @throws Error if fetch fails
 */
export async function getCachedCategories(): Promise<Category[]> {
  try {
    const response = await fetchCategories();
    return response.items;
  } catch (error) {
    console.error('[getCachedCategories] Error fetching categories:', error);
    throw new Error('Failed to load categories');
  }
}

/**
 * Fetch and cache featured tip (most recent) for home page
 * 
 * @returns Featured tip or null if none available
 * @throws Error if fetch fails
 */
export async function getCachedFeaturedTip(): Promise<TipSummary | null> {
  try {
    const response = await fetchTips({
      orderBy: 0,        // CreatedAt
      sortDirection: 1,  // Descending
      pageNumber: 1,
      pageSize: 1,
    });
    return response.items[0] || null;
  } catch (error) {
    console.error('[getCachedFeaturedTip] Error fetching featured tip:', error);
    throw new Error('Failed to load featured tip');
  }
}

/**
 * Fetch and cache latest tips for home page
 * 
 * @returns Array of latest tips (up to 6)
 * @throws Error if fetch fails
 */
export async function getCachedLatestTips(): Promise<TipSummary[]> {
  try {
    const response = await fetchTips({
      orderBy: 0,        // CreatedAt
      sortDirection: 1,  // Descending
      pageNumber: 1,
      pageSize: 6,
    });
    return response.items;
  } catch (error) {
    console.error('[getCachedLatestTips] Error fetching latest tips:', error);
    throw new Error('Failed to load latest tips');
  }
}

/**
 * Fetch all home page data in parallel
 * 
 * This is a convenience function that fetches all data needed for the home page.
 * Each individual fetch is cached independently.
 * 
 * @returns Object containing categories, featured tip, and latest tips
 * @throws Error if any fetch fails
 */
export async function getHomePageData() {
  const [categories, featuredTip, latestTips] = await Promise.all([
    getCachedCategories(),
    getCachedFeaturedTip(),
    getCachedLatestTips(),
  ]);

  return {
    categories,
    featuredTip,
    latestTips,
  };
}
