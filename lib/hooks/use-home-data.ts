'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCategories } from '@/lib/api/categories';
import { fetchTips } from '@/lib/api/tips';
import type { Category, TipSummary } from '@/lib/types/api';

/**
 * State interface for home page data
 */
export interface HomeDataState {
  categories: Category[] | null;
  featuredTip: TipSummary | null;
  latestTips: TipSummary[];
  loading: boolean;
  error: string | null;
}

/**
 * Return type for useHomeData hook
 */
export interface UseHomeDataReturn extends HomeDataState {
  retry: () => void;
}

/**
 * Custom hook for fetching home page data
 * 
 * Fetches categories and tips in parallel, manages loading/error states,
 * and provides retry functionality. Prevents duplicate requests.
 * 
 * @returns Home page data state and retry function
 * 
 * @example
 * function HomePage() {
 *   const { categories, featuredTip, latestTips, loading, error, retry } = useHomeData();
 *   
 *   if (loading) return <LoadingState />;
 *   if (error) return <ErrorState onRetry={retry} />;
 *   return <HomeContent data={{ categories, featuredTip, latestTips }} />;
 * }
 */
export function useHomeData(): UseHomeDataReturn {
  const [state, setState] = useState<HomeDataState>({
    categories: null,
    featuredTip: null,
    latestTips: [],
    loading: true,
    error: null,
  });

  // Track if a request is in progress to prevent duplicates
  const requestInProgressRef = useRef(false);
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  /**
   * Fetch all home page data in parallel
   */
  const fetchData = useCallback(async () => {
    // Prevent duplicate requests
    if (requestInProgressRef.current) {
      return;
    }

    requestInProgressRef.current = true;

    // Only update state if component is still mounted
    if (isMountedRef.current) {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));
    }

    try {
      // Fetch categories and tips in parallel for better performance
      const [categoriesResponse, featuredTipResponse, latestTipsResponse] =
        await Promise.all([
          fetchCategories(),
          // Fetch most recent tip (orderBy=0 is CreatedAt, sortDirection=1 is Descending)
          fetchTips({
            orderBy: 0,
            sortDirection: 1,
            pageNumber: 1,
            pageSize: 1,
          }),
          // Fetch 6 latest tips
          fetchTips({
            orderBy: 0,
            sortDirection: 1,
            pageNumber: 1,
            pageSize: 6,
          }),
        ]);

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setState({
          categories: categoriesResponse.items,
          featuredTip: featuredTipResponse.items[0] || null,
          latestTips: latestTipsResponse.items,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        // Sanitize error message - don't expose technical details
        const errorMessage =
          err instanceof Error
            ? 'Unable to load content. Please try again.'
            : 'An unexpected error occurred. Please try again.';

        setState({
          categories: null,
          featuredTip: null,
          latestTips: [],
          loading: false,
          error: errorMessage,
        });
      }
    } finally {
      requestInProgressRef.current = false;
    }
  }, []);

  /**
   * Retry fetching data after an error
   */
  const retry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Fetch data on mount
  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    // Cleanup: mark component as unmounted
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  return {
    ...state,
    retry,
  };
}
