/**
 * Unit Tests for Categories API Functions
 *
 * Tests category API functions with mocked fetch calls.
 * Covers success scenarios, error handling, timeout handling, and malformed responses.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCategories, APIError } from './categories';
import type { CategoryListResponse, Category } from '../types/api';

// Store original fetch
const originalFetch = global.fetch;

describe('Categories API Functions', () => {
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

  describe('fetchCategories', () => {
    it('fetchCategories_ShouldReturnCategoryList_WhenAPICallSucceeds', async () => {
      // Arrange
      const mockCategories: Category[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Kitchen',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: null,
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          name: 'Cleaning',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        },
      ];

      const mockResponse: CategoryListResponse = {
        items: mockCategories,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      // Act
      const result = await fetchCategories();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('Kitchen');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/Category'),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('fetchCategories_ShouldReturnEmptyList_WhenNoCategories', async () => {
      // Arrange
      const mockResponse: CategoryListResponse = {
        items: [],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      // Act
      const result = await fetchCategories();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.items).toHaveLength(0);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('fetchCategories_ShouldUseCorrectAPIEndpoint_WhenCalled', async () => {
      // Arrange
      const mockResponse: CategoryListResponse = {
        items: [],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      // Act
      await fetchCategories();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/Category$/),
        expect.any(Object)
      );
    });

    it('fetchCategories_ShouldThrowAPIError_When400BadRequest', async () => {
      // Arrange
      const mockProblemDetails = {
        type: 'https://httpstatuses.io/400/validation-error',
        title: 'Validation error',
        status: 400,
        detail: 'Invalid request parameters',
        instance: '/api/Category',
        correlationId: 'abc123',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockProblemDetails,
      } as Response);

      // Act & Assert
      await expect(fetchCategories()).rejects.toThrow(APIError);
      await expect(fetchCategories()).rejects.toThrow('Invalid request parameters');

      const error = await fetchCategories().catch((e) => e);
      expect(error).toBeInstanceOf(APIError);
      expect(error.problemDetails).toEqual(mockProblemDetails);
      expect(error.problemDetails.correlationId).toBe('abc123');
    });

    it('fetchCategories_ShouldThrowAPIError_When500InternalServerError', async () => {
      // Arrange
      const mockProblemDetails = {
        type: 'https://httpstatuses.io/500/infrastructure-error',
        title: 'Infrastructure error',
        status: 500,
        detail: 'An unexpected error occurred while processing your request.',
        instance: '/api/Category',
        correlationId: 'def456',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => mockProblemDetails,
      } as Response);

      // Act & Assert
      await expect(fetchCategories()).rejects.toThrow(APIError);

      const error = await fetchCategories().catch((e) => e);
      expect(error).toBeInstanceOf(APIError);
      expect(error.problemDetails.status).toBe(500);
    });

    it('fetchCategories_ShouldHandleMalformedErrorResponse_WhenJSONParseFails', async () => {
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
      await expect(fetchCategories()).rejects.toThrow(APIError);

      const error = await fetchCategories().catch((e) => e);
      expect(error).toBeInstanceOf(APIError);
      expect(error.problemDetails.type).toBe('unknown');
      expect(error.problemDetails.title).toBe('Request Failed');
      expect(error.problemDetails.status).toBe(503);
      expect(error.problemDetails.detail).toBe('Service Unavailable');
    });

    it(
      'fetchCategories_ShouldThrowTimeoutError_WhenRequestExceedsTimeout',
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
            // Never resolve - simulates a hanging request
          });
        });

        // Act & Assert - create promise and immediately start assertion
        const assertionPromise = expect(fetchCategories()).rejects.toThrow('Request timeout - please try again');

        // Fast-forward time to trigger timeout
        await vi.advanceTimersByTimeAsync(10000);

        // Wait for assertion
        await assertionPromise;
      }
    );

    it('fetchCategories_ShouldThrowNetworkError_WhenFetchFails', async () => {
      // Arrange
      global.fetch = vi.fn().mockRejectedValue(new Error('Network connection failed'));

      // Act & Assert
      await expect(fetchCategories()).rejects.toThrow('Network connection failed');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('fetchCategories_ShouldHandleMalformedSuccessResponse_WhenJSONParseFails', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Malformed JSON response');
        },
      } as Response);

      // Act & Assert
      await expect(fetchCategories()).rejects.toThrow('Malformed JSON response');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('fetchCategories_ShouldIncludeAbortSignal_WhenMakingRequest', async () => {
      // Arrange
      const mockResponse: CategoryListResponse = {
        items: [],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      // Act
      await fetchCategories();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('fetchCategories_ShouldClearTimeout_WhenRequestSucceeds', async () => {
      // Arrange
      const mockResponse: CategoryListResponse = {
        items: [],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      // Act
      await fetchCategories();

      // Assert
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('fetchCategories_ShouldClearTimeout_WhenRequestFails', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          type: 'error',
          title: 'Error',
          status: 500,
          detail: 'Server error',
          instance: '/api/Category',
        }),
      } as Response);

      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      // Act
      await fetchCategories().catch(() => {});

      // Assert
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('fetchCategories_ShouldPreserveAllCategoryFields_WhenReturned', async () => {
      // Arrange
      const mockCategory: Category = {
        id: '323e4567-e89b-12d3-a456-426614174002',
        name: 'Tech Help',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T15:45:00Z',
      };

      const mockResponse: CategoryListResponse = {
        items: [mockCategory],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      // Act
      const result = await fetchCategories();

      // Assert
      expect(result.items[0]).toEqual(mockCategory);
      expect(result.items[0].id).toBe(mockCategory.id);
      expect(result.items[0].name).toBe(mockCategory.name);
      expect(result.items[0].createdAt).toBe(mockCategory.createdAt);
      expect(result.items[0].updatedAt).toBe(mockCategory.updatedAt);
    });

    it('fetchCategories_ShouldHandleNullUpdatedAt_WhenCategoryNotUpdated', async () => {
      // Arrange
      const mockCategory: Category = {
        id: '423e4567-e89b-12d3-a456-426614174003',
        name: 'DIY Repair',
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: null,
      };

      const mockResponse: CategoryListResponse = {
        items: [mockCategory],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      // Act
      const result = await fetchCategories();

      // Assert
      expect(result.items[0].updatedAt).toBeNull();
    });
  });
});
