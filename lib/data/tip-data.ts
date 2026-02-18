'use cache';

import * as Sentry from '@sentry/nextjs';
import { fetchTipById, fetchTipsByCategory, fetchTips } from '@/lib/api/tips';
import { TipSortField, SortDirection, type TipDetail, type TipSummary, type PagedTipsResponse } from '@/lib/types/api';
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

  return Sentry.startSpan(
    {
      op: 'http.client',
      name: `GET /api/tips/${id}`,
    },
    async (span) => {
      span.setAttribute('tip.id', id);
      
      try {
        const tip = await fetchTipById(id);
        span.setAttribute('tip.found', true);
        return tip;
      } catch (error) {
        span.setAttribute('tip.found', false);
        console.error('[getCachedTipById] Error fetching tip:', {
          error,
          tipId: id,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
        Sentry.captureException(error);
        throw new Error(`Failed to load tip: ${id}`);
      }
    }
  );
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

  return Sentry.startSpan(
    {
      op: 'http.client',
      name: `GET /api/tips/category/${categoryId}`,
    },
    async (span) => {
      span.setAttribute('category.id', categoryId);
      span.setAttribute('current.tip.id', currentTipId);
      
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

        span.setAttribute('related.tips.count', relatedTips.length);
        return relatedTips;
      } catch (error) {
        console.error('[getCachedRelatedTips] Error fetching related tips:', {
          error,
          categoryId,
          currentTipId,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
        Sentry.captureException(error);
        // Return empty array for graceful degradation
        return [];
      }
    }
  );
}

/**
 * Get cached latest tips
 * 
 * Fetches latest tips sorted by creation date with 5-minute cache.
 * Returns empty results on error (graceful degradation).
 */
export async function getCachedLatestTips(
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<PagedTipsResponse> {
  'use cache';
  cacheLife('default');

  try {
    const response = await fetchTips({
      pageNumber,
      pageSize,
      orderBy: TipSortField.CreatedAt,
      sortDirection: SortDirection.Descending,
    });
    return response;
  } catch (error) {
    console.error('[getCachedLatestTips] Error fetching latest tips:', {
      error,
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

/**
 * Get cached popular tips
 * 
 * Fetches popular tips sorted by creation date with 5-minute cache.
 * Note: API doesn't support sorting by view count, using CreatedAt instead.
 * Returns empty results on error (graceful degradation).
 */
export async function getCachedPopularTips(
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<PagedTipsResponse> {
  'use cache';
  cacheLife('default');

  try {
    const response = await fetchTips({
      pageNumber,
      pageSize,
      orderBy: TipSortField.CreatedAt, //TODO: We need to improve this
      sortDirection: SortDirection.Descending,
    });
    return response;
  } catch (error) {
    console.error('[getCachedPopularTips] Error fetching popular tips:', {
      error,
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
