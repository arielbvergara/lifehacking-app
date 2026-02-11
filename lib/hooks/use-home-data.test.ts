import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHomeData } from './use-home-data';
import type { CategoryListResponse, PagedTipsResponse } from '@/lib/types/api';

// Mock API functions
vi.mock('@/lib/api/categories', () => ({
  fetchCategories: vi.fn(),
}));

vi.mock('@/lib/api/tips', () => ({
  fetchTips: vi.fn(),
}));

import { fetchCategories } from '@/lib/api/categories';
import { fetchTips } from '@/lib/api/tips';

const mockFetchCategories = vi.mocked(fetchCategories);
const mockFetchTips = vi.mocked(fetchTips);

describe('useHomeData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Parallel API Calls', () => {
    it('should fetch categories and tips in parallel', async () => {
      const mockCategories: CategoryListResponse = {
        items: [
          {
            id: '1',
            name: 'Kitchen',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: null,
          },
        ],
      };

      const mockFeaturedTip: PagedTipsResponse = {
        items: [
          {
            id: 'tip-1',
            title: 'Featured Tip',
            description: 'Description',
            categoryId: '1',
            categoryName: 'Kitchen',
            tags: [],
            videoUrl: null,
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
        metadata: {
          totalItems: 1,
          pageNumber: 1,
          pageSize: 1,
          totalPages: 1,
        },
      };

      const mockLatestTips: PagedTipsResponse = {
        items: [
          {
            id: 'tip-2',
            title: 'Latest Tip',
            description: 'Description',
            categoryId: '1',
            categoryName: 'Kitchen',
            tags: [],
            videoUrl: null,
            createdAt: '2024-01-02T00:00:00Z',
          },
        ],
        metadata: {
          totalItems: 1,
          pageNumber: 1,
          pageSize: 6,
          totalPages: 1,
        },
      };

      mockFetchCategories.mockResolvedValue(mockCategories);
      mockFetchTips
        .mockResolvedValueOnce(mockFeaturedTip)
        .mockResolvedValueOnce(mockLatestTips);

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetchCategories).toHaveBeenCalledTimes(1);
      expect(mockFetchTips).toHaveBeenCalledTimes(2);
      expect(result.current.categories).toEqual(mockCategories.items);
      expect(result.current.featuredTip).toEqual(mockFeaturedTip.items[0]);
      expect(result.current.latestTips).toEqual(mockLatestTips.items);
    });

    it('should call fetchTips with correct parameters for featured tip', async () => {
      mockFetchCategories.mockResolvedValue({ items: [] });
      mockFetchTips.mockResolvedValue({
        items: [],
        metadata: { totalItems: 0, pageNumber: 1, pageSize: 1, totalPages: 0 },
      });

      renderHook(() => useHomeData());

      await waitFor(() => {
        expect(mockFetchTips).toHaveBeenCalledWith({
          orderBy: 0,
          sortDirection: 1,
          pageNumber: 1,
          pageSize: 1,
        });
      });
    });

    it('should call fetchTips with correct parameters for latest tips', async () => {
      mockFetchCategories.mockResolvedValue({ items: [] });
      mockFetchTips.mockResolvedValue({
        items: [],
        metadata: { totalItems: 0, pageNumber: 1, pageSize: 6, totalPages: 0 },
      });

      renderHook(() => useHomeData());

      await waitFor(() => {
        expect(mockFetchTips).toHaveBeenCalledWith({
          orderBy: 0,
          sortDirection: 1,
          pageNumber: 1,
          pageSize: 6,
        });
      });
    });
  });

  describe('Loading States', () => {
    it('should start with loading true', () => {
      mockFetchCategories.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      mockFetchTips.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useHomeData());

      expect(result.current.loading).toBe(true);
      expect(result.current.categories).toBeNull();
      expect(result.current.featuredTip).toBeNull();
      expect(result.current.latestTips).toEqual([]);
    });

    it('should set loading to false after successful fetch', async () => {
      mockFetchCategories.mockResolvedValue({ items: [] });
      mockFetchTips.mockResolvedValue({
        items: [],
        metadata: { totalItems: 0, pageNumber: 1, pageSize: 1, totalPages: 0 },
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set loading to false after error', async () => {
      mockFetchCategories.mockRejectedValue(new Error('Network error'));
      mockFetchTips.mockResolvedValue({
        items: [],
        metadata: { totalItems: 0, pageNumber: 1, pageSize: 1, totalPages: 0 },
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle category fetch error', async () => {
      mockFetchCategories.mockRejectedValue(new Error('Network error'));
      mockFetchTips.mockResolvedValue({
        items: [],
        metadata: { totalItems: 0, pageNumber: 1, pageSize: 1, totalPages: 0 },
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.categories).toBeNull();
    });

    it('should handle tips fetch error', async () => {
      mockFetchCategories.mockResolvedValue({ items: [] });
      mockFetchTips.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.latestTips).toEqual([]);
    });

    it('should sanitize error messages', async () => {
      mockFetchCategories.mockRejectedValue(
        new Error('Internal server error: database connection failed')
      );
      mockFetchTips.mockResolvedValue({
        items: [],
        metadata: { totalItems: 0, pageNumber: 1, pageSize: 1, totalPages: 0 },
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Error message should not contain technical details
      expect(result.current.error).not.toContain('database');
      expect(result.current.error).not.toContain('Internal server error');
      expect(result.current.error).toBe(
        'Unable to load content. Please try again.'
      );
    });

    it('should handle non-Error exceptions', async () => {
      mockFetchCategories.mockRejectedValue('String error');
      mockFetchTips.mockResolvedValue({
        items: [],
        metadata: { totalItems: 0, pageNumber: 1, pageSize: 1, totalPages: 0 },
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toBe(
        'An unexpected error occurred. Please try again.'
      );
    });
  });

  describe('Retry Functionality', () => {
    it('should retry fetching data when retry is called', async () => {
      mockFetchCategories.mockRejectedValueOnce(new Error('Network error'));
      mockFetchTips.mockResolvedValue({
        items: [],
        metadata: { totalItems: 0, pageNumber: 1, pageSize: 1, totalPages: 0 },
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Now mock successful response
      mockFetchCategories.mockResolvedValue({ items: [] });

      // Call retry
      result.current.retry();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
      });

      // Should have been called twice (initial + retry)
      expect(mockFetchCategories).toHaveBeenCalledTimes(2);
    });

    it('should clear error state when retrying', async () => {
      mockFetchCategories.mockRejectedValueOnce(new Error('Network error'));
      mockFetchTips.mockResolvedValue({
        items: [],
        metadata: { totalItems: 0, pageNumber: 1, pageSize: 1, totalPages: 0 },
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      mockFetchCategories.mockResolvedValue({ items: [] });

      result.current.retry();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Request Deduplication', () => {
    it('should not make duplicate requests if already in progress', async () => {
      let resolveCategories: (value: CategoryListResponse) => void;
      const categoriesPromise = new Promise<CategoryListResponse>((resolve) => {
        resolveCategories = resolve;
      });

      mockFetchCategories.mockReturnValue(categoriesPromise);
      mockFetchTips.mockResolvedValue({
        items: [],
        metadata: { totalItems: 0, pageNumber: 1, pageSize: 1, totalPages: 0 },
      });

      const { result, rerender } = renderHook(() => useHomeData());

      // Trigger multiple re-renders while request is in progress
      rerender();
      rerender();
      rerender();

      // Resolve the promise
      resolveCategories!({ items: [] });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should only have been called once despite multiple re-renders
      expect(mockFetchCategories).toHaveBeenCalledTimes(1);
    });
  });

  describe('Data Handling', () => {
    it('should handle empty categories response', async () => {
      mockFetchCategories.mockResolvedValue({ items: [] });
      mockFetchTips.mockResolvedValue({
        items: [],
        metadata: { totalItems: 0, pageNumber: 1, pageSize: 1, totalPages: 0 },
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle empty featured tip response', async () => {
      mockFetchCategories.mockResolvedValue({ items: [] });
      mockFetchTips.mockResolvedValue({
        items: [],
        metadata: { totalItems: 0, pageNumber: 1, pageSize: 1, totalPages: 0 },
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.featuredTip).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should handle empty latest tips response', async () => {
      mockFetchCategories.mockResolvedValue({ items: [] });
      mockFetchTips.mockResolvedValue({
        items: [],
        metadata: { totalItems: 0, pageNumber: 1, pageSize: 6, totalPages: 0 },
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.latestTips).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Cleanup', () => {
    it('should not update state after unmount', async () => {
      let resolveCategories: (value: CategoryListResponse) => void;
      const categoriesPromise = new Promise<CategoryListResponse>((resolve) => {
        resolveCategories = resolve;
      });

      mockFetchCategories.mockReturnValue(categoriesPromise);
      mockFetchTips.mockResolvedValue({
        items: [],
        metadata: { totalItems: 0, pageNumber: 1, pageSize: 1, totalPages: 0 },
      });

      const { result, unmount } = renderHook(() => useHomeData());

      expect(result.current.loading).toBe(true);

      // Unmount before promise resolves
      unmount();

      // Resolve the promise after unmount
      resolveCategories!({ items: [] });

      // Wait a bit to ensure no state updates occur
      await new Promise((resolve) => setTimeout(resolve, 100));

      // No errors should be thrown from state updates after unmount
    });
  });
});
