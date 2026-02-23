/**
 * Unit Tests for Tips API Functions
 *
 * Tests tip API functions with mocked fetch calls.
 * Covers success scenarios, error handling, timeout handling, and malformed responses.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTips, fetchTipById, fetchTipsByCategory, APIError, type FetchTipsParams } from './tips';
import type {
  PagedTipsResponse,
  TipDetail,
  TipSummary,
  TipSortField,
  SortDirection,
} from '../types/api';

// Store original fetch
const originalFetch = global.fetch;

describe('Tips API Functions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore original fetch and timers after each test
    global.fetch = originalFetch;
    vi.useRealTimers();
  });

  describe('fetchTips', () => {
    const mockTipSummary: TipSummary = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Quick Kitchen Hack',
      description: 'Save time with this simple trick',
      categoryId: '223e4567-e89b-12d3-a456-426614174001',
      categoryName: 'Kitchen',
      tags: ['cooking', 'time-saving'],
      videoUrl: null,
      createdAt: '2024-01-01T00:00:00Z',
    };

    const mockPagedResponse: PagedTipsResponse = {
      items: [mockTipSummary],
      metadata: {
        totalItems: 1,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      },
    };

    it('fetchTips_ShouldReturnPagedTipsList_WhenAPICallSucceeds', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      // Act
      const result = await fetchTips();

      // Assert
      expect(result).toEqual(mockPagedResponse);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('Quick Kitchen Hack');
      expect(result.metadata.totalItems).toBe(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('fetchTips_ShouldReturnEmptyList_WhenNoTips', async () => {
      // Arrange
      const emptyResponse: PagedTipsResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => emptyResponse,
      } as Response);

      // Act
      const result = await fetchTips();

      // Assert
      expect(result.items).toHaveLength(0);
      expect(result.metadata.totalItems).toBe(0);
    });

    it('fetchTips_ShouldBuildCorrectURL_WhenNoParameters', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      // Act
      await fetchTips();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/Tip$/),
        expect.any(Object)
      );
    });

    it('fetchTips_ShouldBuildCorrectURL_WhenSearchQueryProvided', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      const params: FetchTipsParams = { q: 'kitchen hack' };

      // Act
      await fetchTips(params);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/Tip\?.*q=kitchen\+hack/),
        expect.any(Object)
      );
    });

    it('fetchTips_ShouldBuildCorrectURL_WhenCategoryIdProvided', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      const params: FetchTipsParams = {
        categoryId: '223e4567-e89b-12d3-a456-426614174001',
      };

      // Act
      await fetchTips(params);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/categoryId=223e4567-e89b-12d3-a456-426614174001/),
        expect.any(Object)
      );
    });

    it('fetchTips_ShouldBuildCorrectURL_WhenTagsProvided', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      const params: FetchTipsParams = {
        tags: ['cooking', 'time-saving'],
      };

      // Act
      await fetchTips(params);

      // Assert
      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(fetchCall).toContain('tags=cooking');
      expect(fetchCall).toContain('tags=time-saving');
    });

    it('fetchTips_ShouldBuildCorrectURL_WhenSortingParametersProvided', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      const params: FetchTipsParams = {
        orderBy: 0 as TipSortField, // CreatedAt
        sortDirection: 1 as SortDirection, // Descending
      };

      // Act
      await fetchTips(params);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/orderBy=0/),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/sortDirection=1/),
        expect.any(Object)
      );
    });

    it('fetchTips_ShouldBuildCorrectURL_WhenPaginationParametersProvided', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      const params: FetchTipsParams = {
        pageNumber: 2,
        pageSize: 20,
      };

      // Act
      await fetchTips(params);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/pageNumber=2/),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/pageSize=20/),
        expect.any(Object)
      );
    });

    it('fetchTips_ShouldBuildCorrectURL_WhenAllParametersProvided', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      const params: FetchTipsParams = {
        q: 'kitchen',
        categoryId: '223e4567-e89b-12d3-a456-426614174001',
        tags: ['cooking'],
        orderBy: 0 as TipSortField,
        sortDirection: 1 as SortDirection,
        pageNumber: 1,
        pageSize: 6,
      };

      // Act
      await fetchTips(params);

      // Assert
      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(fetchCall).toContain('q=kitchen');
      expect(fetchCall).toContain('categoryId=223e4567-e89b-12d3-a456-426614174001');
      expect(fetchCall).toContain('tags=cooking');
      expect(fetchCall).toContain('orderBy=0');
      expect(fetchCall).toContain('sortDirection=1');
      expect(fetchCall).toContain('pageNumber=1');
      expect(fetchCall).toContain('pageSize=6');
    });

    it('fetchTips_ShouldThrowAPIError_When400BadRequest', async () => {
      // Arrange
      const mockProblemDetails = {
        type: 'https://httpstatuses.io/400/validation-error',
        title: 'Validation error',
        status: 400,
        detail: 'Invalid query parameters',
        instance: '/api/Tip',
        correlationId: 'xyz789',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockProblemDetails,
      } as Response);

      // Act & Assert
      await expect(fetchTips()).rejects.toThrow(APIError);
      await expect(fetchTips()).rejects.toThrow('The request could not be completed. Please try again.');

      const error = await fetchTips().catch((e) => e);
      expect(error).toBeInstanceOf(APIError);
    });

    it('fetchTips_ShouldThrowAPIError_When500InternalServerError', async () => {
      // Arrange
      const mockProblemDetails = {
        type: 'https://httpstatuses.io/500/infrastructure-error',
        title: 'Infrastructure error',
        status: 500,
        detail: 'An unexpected error occurred',
        instance: '/api/Tip',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => mockProblemDetails,
      } as Response);

      // Act & Assert
      await expect(fetchTips()).rejects.toThrow(APIError);

      const error = await fetchTips().catch((e) => e);
      expect(error).toBeInstanceOf(APIError);
      expect(error.problemDetails.status).toBe(500);
    });

    it('fetchTips_ShouldHandleMalformedErrorResponse_WhenJSONParseFails', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      // Act & Assert
      await expect(fetchTips()).rejects.toThrow(APIError);

      const error = await fetchTips().catch((e) => e);
      expect(error).toBeInstanceOf(APIError);
      expect(error.problemDetails.type).toBe('unknown');
      expect(error.problemDetails.status).toBe(503);
    });

    it(
      'fetchTips_ShouldThrowTimeoutError_WhenRequestExceedsTimeout',
      { timeout: 15000 },
      async () => {
        // Arrange
        global.fetch = vi.fn().mockImplementation((url, options) => {
          return new Promise((resolve, reject) => {
            const signal = (options as RequestInit)?.signal;
            if (signal) {
              signal.addEventListener('abort', () => {
                reject(new DOMException('The operation was aborted.', 'AbortError'));
              });
            }
          });
        });

        // Act & Assert - create promise and immediately start assertion
        const assertionPromise = expect(fetchTips()).rejects.toThrow('Request timeout - please try again');

        // Fast-forward time to trigger timeout
        await vi.advanceTimersByTimeAsync(10000);

        // Wait for assertion
        await assertionPromise;
      }
    );

    it('fetchTips_ShouldThrowNetworkError_WhenFetchFails', async () => {
      // Arrange
      global.fetch = vi.fn().mockRejectedValue(new Error('Network connection failed'));

      // Act & Assert
      await expect(fetchTips()).rejects.toThrow('Network connection failed');
    });

    it('fetchTips_ShouldHandleMalformedSuccessResponse_WhenJSONParseFails', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Malformed JSON response');
        },
      } as Response);

      // Act & Assert
      await expect(fetchTips()).rejects.toThrow('Malformed JSON response');
    });

    it('fetchTips_ShouldPreserveAllTipFields_WhenReturned', async () => {
      // Arrange
      const completeTip: TipSummary = {
        id: '323e4567-e89b-12d3-a456-426614174002',
        title: 'Complete Tip',
        description: 'Full description here',
        categoryId: '423e4567-e89b-12d3-a456-426614174003',
        categoryName: 'Cleaning',
        tags: ['quick', 'easy', 'effective'],
        videoUrl: 'https://example.com/video.mp4',
        createdAt: '2024-02-01T10:30:00Z',
      };

      const response: PagedTipsResponse = {
        items: [completeTip],
        metadata: {
          totalItems: 1,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
      } as Response);

      // Act
      const result = await fetchTips();

      // Assert
      expect(result.items[0]).toEqual(completeTip);
      expect(result.items[0].tags).toEqual(['quick', 'easy', 'effective']);
      expect(result.items[0].videoUrl).toBe('https://example.com/video.mp4');
    });

    it('fetchTips_ShouldHandleNullVideoUrl_WhenNoVideo', async () => {
      // Arrange
      const tipWithoutVideo: TipSummary = {
        id: '523e4567-e89b-12d3-a456-426614174004',
        title: 'Text Only Tip',
        description: 'No video for this one',
        categoryId: '623e4567-e89b-12d3-a456-426614174005',
        categoryName: 'Tech Help',
        tags: [],
        videoUrl: null,
        createdAt: '2024-03-01T00:00:00Z',
      };

      const response: PagedTipsResponse = {
        items: [tipWithoutVideo],
        metadata: {
          totalItems: 1,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
      } as Response);

      // Act
      const result = await fetchTips();

      // Assert
      expect(result.items[0].videoUrl).toBeNull();
    });

    it('fetchTips_ShouldIncludeAbortSignal_WhenMakingRequest', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      // Act
      await fetchTips();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });
  });


  describe('fetchTipById', () => {
    const mockTipDetail: TipDetail = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Detailed Kitchen Hack',
      description: 'Complete guide to this hack',
      categoryId: '223e4567-e89b-12d3-a456-426614174001',
      categoryName: 'Kitchen',
      tags: ['cooking', 'time-saving'],
      videoUrl: 'https://example.com/video.mp4',
      videoUrlId: 'abc123',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      steps: [
        { stepNumber: 1, description: 'First step' },
        { stepNumber: 2, description: 'Second step' },
      ],
    };

    it('fetchTipById_ShouldReturnTipDetail_WhenAPICallSucceeds', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockTipDetail,
      } as Response);

      // Act
      const result = await fetchTipById('123e4567-e89b-12d3-a456-426614174000');

      // Assert
      expect(result).toEqual(mockTipDetail);
      expect(result.title).toBe('Detailed Kitchen Hack');
      expect(result.steps).toHaveLength(2);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('fetchTipById_ShouldUseCorrectAPIEndpoint_WhenCalled', async () => {
      // Arrange
      const tipId = '123e4567-e89b-12d3-a456-426614174000';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockTipDetail,
      } as Response);

      // Act
      await fetchTipById(tipId);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`/api/Tip/${tipId}$`)),
        expect.any(Object)
      );
    });

    it('fetchTipById_ShouldThrowAPIError_When404NotFound', async () => {
      // Arrange
      const mockProblemDetails = {
        type: 'https://httpstatuses.io/404/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Tip not found',
        instance: '/api/Tip/123e4567-e89b-12d3-a456-426614174000',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => mockProblemDetails,
      } as Response);

      // Act & Assert
      await expect(
        fetchTipById('123e4567-e89b-12d3-a456-426614174000')
      ).rejects.toThrow(APIError);
      await expect(
        fetchTipById('123e4567-e89b-12d3-a456-426614174000')
      ).rejects.toThrow('The request could not be completed. Please try again.');
    });

    it('fetchTipById_ShouldThrowAPIError_When500InternalServerError', async () => {
      // Arrange
      const mockProblemDetails = {
        type: 'https://httpstatuses.io/500/infrastructure-error',
        title: 'Infrastructure error',
        status: 500,
        detail: 'An unexpected error occurred',
        instance: '/api/Tip/123e4567-e89b-12d3-a456-426614174000',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => mockProblemDetails,
      } as Response);

      // Act & Assert
      await expect(
        fetchTipById('123e4567-e89b-12d3-a456-426614174000')
      ).rejects.toThrow(APIError);

      const error = await fetchTipById('123e4567-e89b-12d3-a456-426614174000').catch(
        (e) => e
      );
      expect(error).toBeInstanceOf(APIError);
      expect(error.problemDetails.status).toBe(500);
    });

    it('fetchTipById_ShouldHandleMalformedErrorResponse_WhenJSONParseFails', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      // Act & Assert
      await expect(
        fetchTipById('123e4567-e89b-12d3-a456-426614174000')
      ).rejects.toThrow(APIError);

      const error = await fetchTipById('123e4567-e89b-12d3-a456-426614174000').catch(
        (e) => e
      );
      expect(error).toBeInstanceOf(APIError);
      expect(error.problemDetails.type).toBe('unknown');
    });

    it(
      'fetchTipById_ShouldThrowTimeoutError_WhenRequestExceedsTimeout',
      { timeout: 15000 },
      async () => {
        // Arrange
        global.fetch = vi.fn().mockImplementation((url, options) => {
          return new Promise((resolve, reject) => {
            const signal = (options as RequestInit)?.signal;
            if (signal) {
              signal.addEventListener('abort', () => {
                reject(new DOMException('The operation was aborted.', 'AbortError'));
              });
            }
          });
        });

        // Act & Assert - create promise and immediately start assertion
        const assertionPromise = expect(fetchTipById('123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow('Request timeout - please try again');

        // Fast-forward time to trigger timeout
        await vi.advanceTimersByTimeAsync(10000);

        // Wait for assertion
        await assertionPromise;
      }
    );

    it('fetchTipById_ShouldThrowNetworkError_WhenFetchFails', async () => {
      // Arrange
      global.fetch = vi.fn().mockRejectedValue(new Error('Network connection failed'));

      // Act & Assert
      await expect(
        fetchTipById('123e4567-e89b-12d3-a456-426614174000')
      ).rejects.toThrow('Network connection failed');
    });

    it('fetchTipById_ShouldHandleMalformedSuccessResponse_WhenJSONParseFails', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Malformed JSON response');
        },
      } as Response);

      // Act & Assert
      await expect(
        fetchTipById('123e4567-e89b-12d3-a456-426614174000')
      ).rejects.toThrow('Malformed JSON response');
    });

    it('fetchTipById_ShouldPreserveAllTipDetailFields_WhenReturned', async () => {
      // Arrange
      const completeTipDetail: TipDetail = {
        id: '323e4567-e89b-12d3-a456-426614174002',
        title: 'Complete Detailed Tip',
        description: 'Full description with all fields',
        categoryId: '423e4567-e89b-12d3-a456-426614174003',
        categoryName: 'Cleaning',
        tags: ['quick', 'easy'],
        videoUrl: 'https://example.com/video.mp4',
        videoUrlId: 'xyz789',
        createdAt: '2024-02-01T10:30:00Z',
        updatedAt: '2024-02-15T14:20:00Z',
        steps: [
          { stepNumber: 1, description: 'Step one' },
          { stepNumber: 2, description: 'Step two' },
          { stepNumber: 3, description: 'Step three' },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => completeTipDetail,
      } as Response);

      // Act
      const result = await fetchTipById('323e4567-e89b-12d3-a456-426614174002');

      // Assert
      expect(result).toEqual(completeTipDetail);
      expect(result.steps).toHaveLength(3);
      expect(result.videoUrlId).toBe('xyz789');
      expect(result.updatedAt).toBe('2024-02-15T14:20:00Z');
    });

    it('fetchTipById_ShouldHandleNullVideoFields_WhenNoVideo', async () => {
      // Arrange
      const tipWithoutVideo: TipDetail = {
        id: '523e4567-e89b-12d3-a456-426614174004',
        title: 'Text Only Detailed Tip',
        description: 'No video for this one',
        categoryId: '623e4567-e89b-12d3-a456-426614174005',
        categoryName: 'Tech Help',
        tags: [],
        videoUrl: null,
        videoUrlId: null,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: null,
        steps: [{ stepNumber: 1, description: 'Only step' }],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => tipWithoutVideo,
      } as Response);

      // Act
      const result = await fetchTipById('523e4567-e89b-12d3-a456-426614174004');

      // Assert
      expect(result.videoUrl).toBeNull();
      expect(result.videoUrlId).toBeNull();
      expect(result.updatedAt).toBeNull();
    });

    it('fetchTipById_ShouldIncludeAbortSignal_WhenMakingRequest', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockTipDetail,
      } as Response);

      // Act
      await fetchTipById('123e4567-e89b-12d3-a456-426614174000');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });
  });

  describe('fetchTipsByCategory', () => {
    const mockTipSummary: TipSummary = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Kitchen Tip',
      description: 'A helpful kitchen tip',
      categoryId: '223e4567-e89b-12d3-a456-426614174001',
      categoryName: 'Kitchen',
      tags: ['cooking'],
      videoUrl: null,
      createdAt: '2024-01-01T00:00:00Z',
    };

    const mockPagedResponse: PagedTipsResponse = {
      items: [mockTipSummary],
      metadata: {
        totalItems: 1,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
      },
    };

    it('fetchTipsByCategory_ShouldReturnPagedTipsList_WhenAPICallSucceeds', async () => {
      // Arrange
      const categoryId = '223e4567-e89b-12d3-a456-426614174001';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      // Act
      const result = await fetchTipsByCategory(categoryId);

      // Assert
      expect(result).toEqual(mockPagedResponse);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].categoryId).toBe(categoryId);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('fetchTipsByCategory_ShouldBuildCorrectURL_WhenNoParameters', async () => {
      // Arrange
      const categoryId = '223e4567-e89b-12d3-a456-426614174001';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      // Act
      await fetchTipsByCategory(categoryId);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`/api/Category/${categoryId}/tips\\?`)),
        expect.any(Object)
      );
    });

    it('fetchTipsByCategory_ShouldBuildCorrectURL_WhenPaginationParametersProvided', async () => {
      // Arrange
      const categoryId = '223e4567-e89b-12d3-a456-426614174001';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      const params: FetchTipsParams = {
        pageNumber: 2,
        pageSize: 5,
      };

      // Act
      await fetchTipsByCategory(categoryId, params);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/pageNumber=2/),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/pageSize=5/),
        expect.any(Object)
      );
    });

    it('fetchTipsByCategory_ShouldBuildCorrectURL_WhenSortingParametersProvided', async () => {
      // Arrange
      const categoryId = '223e4567-e89b-12d3-a456-426614174001';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      const params: FetchTipsParams = {
        orderBy: 0 as TipSortField, // CreatedAt
        sortDirection: 1 as SortDirection, // Descending
      };

      // Act
      await fetchTipsByCategory(categoryId, params);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/orderBy=0/),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/sortDirection=1/),
        expect.any(Object)
      );
    });

    it('fetchTipsByCategory_ShouldBuildCorrectURL_WhenAllParametersProvided', async () => {
      // Arrange
      const categoryId = '223e4567-e89b-12d3-a456-426614174001';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      const params: FetchTipsParams = {
        pageNumber: 1,
        pageSize: 4,
        orderBy: 0 as TipSortField,
        sortDirection: 1 as SortDirection,
      };

      // Act
      await fetchTipsByCategory(categoryId, params);

      // Assert
      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(fetchCall).toContain(`/api/Category/${categoryId}/tips?`);
      expect(fetchCall).toContain('pageNumber=1');
      expect(fetchCall).toContain('pageSize=4');
      expect(fetchCall).toContain('orderBy=0');
      expect(fetchCall).toContain('sortDirection=1');
    });

    it('fetchTipsByCategory_ShouldReturnEmptyList_WhenNoTipsInCategory', async () => {
      // Arrange
      const categoryId = '223e4567-e89b-12d3-a456-426614174001';
      const emptyResponse: PagedTipsResponse = {
        items: [],
        metadata: {
          totalItems: 0,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => emptyResponse,
      } as Response);

      // Act
      const result = await fetchTipsByCategory(categoryId);

      // Assert
      expect(result.items).toHaveLength(0);
      expect(result.metadata.totalItems).toBe(0);
    });

    it('fetchTipsByCategory_ShouldThrowAPIError_When400BadRequest', async () => {
      // Arrange
      const categoryId = 'invalid-uuid';
      const mockProblemDetails = {
        type: 'https://httpstatuses.io/400/validation-error',
        title: 'Validation error',
        status: 400,
        detail: 'Invalid category ID format',
        instance: `/api/Category/${categoryId}/tips`,
        correlationId: 'xyz789',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockProblemDetails,
      } as Response);

      // Act & Assert
      await expect(fetchTipsByCategory(categoryId)).rejects.toThrow(APIError);
      await expect(fetchTipsByCategory(categoryId)).rejects.toThrow('The request could not be completed. Please try again.');

      const error = await fetchTipsByCategory(categoryId).catch((e) => e);
      expect(error).toBeInstanceOf(APIError);
    });

    it('fetchTipsByCategory_ShouldThrowAPIError_When404NotFound', async () => {
      // Arrange
      const categoryId = '223e4567-e89b-12d3-a456-426614174001';
      const mockProblemDetails = {
        type: 'https://httpstatuses.io/404/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Category not found',
        instance: `/api/Category/${categoryId}/tips`,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => mockProblemDetails,
      } as Response);

      // Act & Assert
      await expect(fetchTipsByCategory(categoryId)).rejects.toThrow(APIError);
      await expect(fetchTipsByCategory(categoryId)).rejects.toThrow('The request could not be completed. Please try again.');
    });

    it('fetchTipsByCategory_ShouldThrowAPIError_When500InternalServerError', async () => {
      // Arrange
      const categoryId = '223e4567-e89b-12d3-a456-426614174001';
      const mockProblemDetails = {
        type: 'https://httpstatuses.io/500/infrastructure-error',
        title: 'Infrastructure error',
        status: 500,
        detail: 'An unexpected error occurred',
        instance: `/api/Category/${categoryId}/tips`,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => mockProblemDetails,
      } as Response);

      // Act & Assert
      await expect(fetchTipsByCategory(categoryId)).rejects.toThrow(APIError);

      const error = await fetchTipsByCategory(categoryId).catch((e) => e);
      expect(error).toBeInstanceOf(APIError);
      expect(error.problemDetails.status).toBe(500);
    });

    it('fetchTipsByCategory_ShouldHandleMalformedErrorResponse_WhenJSONParseFails', async () => {
      // Arrange
      const categoryId = '223e4567-e89b-12d3-a456-426614174001';
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      // Act & Assert
      await expect(fetchTipsByCategory(categoryId)).rejects.toThrow(APIError);

      const error = await fetchTipsByCategory(categoryId).catch((e) => e);
      expect(error).toBeInstanceOf(APIError);
      expect(error.problemDetails.type).toBe('unknown');
      expect(error.problemDetails.status).toBe(503);
    });

    it(
      'fetchTipsByCategory_ShouldThrowTimeoutError_WhenRequestExceedsTimeout',
      { timeout: 15000 },
      async () => {
        // Arrange
        const categoryId = '223e4567-e89b-12d3-a456-426614174001';
        global.fetch = vi.fn().mockImplementation((url, options) => {
          return new Promise((resolve, reject) => {
            const signal = (options as RequestInit)?.signal;
            if (signal) {
              signal.addEventListener('abort', () => {
                reject(new DOMException('The operation was aborted.', 'AbortError'));
              });
            }
          });
        });

        // Act & Assert - create promise and immediately start assertion
        const assertionPromise = expect(fetchTipsByCategory(categoryId)).rejects.toThrow('Request timeout - please try again');

        // Fast-forward time to trigger timeout
        await vi.advanceTimersByTimeAsync(10000);

        // Wait for assertion
        await assertionPromise;
      }
    );

    it('fetchTipsByCategory_ShouldThrowNetworkError_WhenFetchFails', async () => {
      // Arrange
      const categoryId = '223e4567-e89b-12d3-a456-426614174001';
      global.fetch = vi.fn().mockRejectedValue(new Error('Network connection failed'));

      // Act & Assert
      await expect(fetchTipsByCategory(categoryId)).rejects.toThrow('Network connection failed');
    });

    it('fetchTipsByCategory_ShouldHandleMalformedSuccessResponse_WhenJSONParseFails', async () => {
      // Arrange
      const categoryId = '223e4567-e89b-12d3-a456-426614174001';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Malformed JSON response');
        },
      } as Response);

      // Act & Assert
      await expect(fetchTipsByCategory(categoryId)).rejects.toThrow('Malformed JSON response');
    });

    it('fetchTipsByCategory_ShouldIncludeAbortSignal_WhenMakingRequest', async () => {
      // Arrange
      const categoryId = '223e4567-e89b-12d3-a456-426614174001';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      // Act
      await fetchTipsByCategory(categoryId);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('fetchTipsByCategory_ShouldPreserveAllTipFields_WhenReturned', async () => {
      // Arrange
      const categoryId = '223e4567-e89b-12d3-a456-426614174001';
      const completeTip: TipSummary = {
        id: '323e4567-e89b-12d3-a456-426614174002',
        title: 'Complete Category Tip',
        description: 'Full description here',
        categoryId: categoryId,
        categoryName: 'Kitchen',
        tags: ['quick', 'easy', 'effective'],
        videoUrl: 'https://example.com/video.mp4',
        createdAt: '2024-02-01T10:30:00Z',
      };

      const response: PagedTipsResponse = {
        items: [completeTip],
        metadata: {
          totalItems: 1,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => response,
      } as Response);

      // Act
      const result = await fetchTipsByCategory(categoryId);

      // Assert
      expect(result.items[0]).toEqual(completeTip);
      expect(result.items[0].tags).toEqual(['quick', 'easy', 'effective']);
      expect(result.items[0].videoUrl).toBe('https://example.com/video.mp4');
    });

    it('fetchTipsByCategory_ShouldNotIncludeSearchOrTagsParameters_WhenCalled', async () => {
      // Arrange
      const categoryId = '223e4567-e89b-12d3-a456-426614174001';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPagedResponse,
      } as Response);

      const params: FetchTipsParams = {
        q: 'search query', // Should be ignored
        tags: ['tag1', 'tag2'], // Should be ignored
        categoryId: 'different-category', // Should be ignored
        pageNumber: 1,
        pageSize: 5,
      };

      // Act
      await fetchTipsByCategory(categoryId, params);

      // Assert
      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(fetchCall).not.toContain('q=');
      expect(fetchCall).not.toContain('tags=');
      expect(fetchCall).not.toContain('categoryId=');
      expect(fetchCall).toContain('pageNumber=1');
      expect(fetchCall).toContain('pageSize=5');
    });
  });

  describe('Pagination Parameter Validation', () => {
    it('fetchTips_ShouldClampPageSize_WhenExceedsMaximum', async () => {
      const mockResponse: PagedTipsResponse = {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 100,
        totalPages: 0,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchTips({ pageSize: 999 });

      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(fetchCall).toContain('pageSize=100');
    });

    it('fetchTips_ShouldClampPageSize_WhenBelowMinimum', async () => {
      const mockResponse: PagedTipsResponse = {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 1,
        totalPages: 0,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchTips({ pageSize: -5 });

      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(fetchCall).toContain('pageSize=1');
    });

    it('fetchTips_ShouldClampPageNumber_WhenBelowMinimum', async () => {
      const mockResponse: PagedTipsResponse = {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      await fetchTips({ pageNumber: -1, pageSize: 10 });

      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(fetchCall).toContain('pageNumber=1');
    });
  });
});
