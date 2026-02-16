'use cache';

import { fetchTipById, fetchTipsByCategory } from '@/lib/api/tips';
import { TipSortField, SortDirection, type TipDetail, type TipSummary } from '@/lib/types/api';
import { cacheLife } from 'next/dist/server/use-cache/cache-life';

/**
 * Cached Tip Data Fetching Functions
 * 
 * These functions use Next.js 16 "use cache" directive for server-side caching.
 * Cache duration is 5 minutes (300 seconds) as configured in next.config.ts.
 */

/**
 * Get cached tip by ID
 * 
 * Fetches a single tip with 5-minute cache.
 * Throws error if tip not found or API fails.
 */
export async function getCachedTipById(id: string): Promise<TipDetail> {
  'use cache';
  cacheLife('default');

  try {
    const tip = await fetchTipById(id);
    return tip;
  } catch (error) {
    console.error('[getCachedTipById] Error fetching tip:', {
      error,
      tipId: id,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    throw new Error(`Failed to load tip: ${id}`);
  }
}

/**
 * Get cached related tips
 * 
 * Fetches related tips from the same category, excluding the current tip.
 * Returns up to 4 related tips with 5-minute cache.
 * Returns empty array on error (graceful degradation).
 */
export async function getCachedRelatedTips(
  categoryId: string,
  currentTipId: string
): Promise<TipSummary[]> {
  'use cache';
  cacheLife('default');

  try {
    // Fetch 5 tips to ensure we have 4 after filtering out current tip
    const response = await fetchTipsByCategory(categoryId, {
      pageSize: 5,
      orderBy: TipSortField.CreatedAt,
      sortDirection: SortDirection.Descending,
    });

    // Filter out the current tip and limit to 4
    const relatedTips = response.items
      .filter((tip) => tip.id !== currentTipId)
      .slice(0, 4);

    return relatedTips;
  } catch (error) {
    console.error('[getCachedRelatedTips] Error fetching related tips:', {
      error,
      categoryId,
      currentTipId,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    // Return empty array for graceful degradation
    return [];
  }
}
