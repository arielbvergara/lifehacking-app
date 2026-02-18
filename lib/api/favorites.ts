/**
 * API service layer for favorites operations
 * Handles authenticated user favorites with server-side persistence
 */

import { TipSummary, ProblemDetails } from '@/lib/types/api';

// Constants
const API_TIMEOUT_MS = 30000; // 30 seconds

// Request/Response Types
export interface GetFavoritesParams {
  q?: string;                    // Search term
  categoryId?: string;           // Category filter
  tags?: string[];               // Tag filters
  orderBy?: 'Title' | 'CreatedAt' | 'UpdatedAt'; // Sort field
  sortDirection?: 'Ascending' | 'Descending';    // Sort direction
  pageNumber?: number;           // Page number (default: 1)
  pageSize?: number;             // Page size (default: 10)
}

// API response structure from backend
export interface FavoriteItem {
  tipId: string;
  addedAt: string;
  tipDetails: TipSummary;
}

export interface FavoritesApiResponse {
  favorites: FavoriteItem[];
  metadata: {
    totalItems: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
}

// Normalized response for frontend consumption
export interface PaginatedFavoritesResponse {
  items: TipSummary[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface MergeResult {
  addedCount: number;
  skippedCount: number;
  failedCount: number;
  failedTipIds: string[];
}

export interface FavoritesApiError extends Error {
  status: number;
  correlationId?: string;
  detail?: string;
}

/**
 * Get user's favorites with pagination and filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @param token - Firebase ID token for authorization
 * @returns Promise with paginated favorites response
 * @throws FavoritesApiError if request fails
 */
export async function getFavorites(
  params: GetFavoritesParams,
  token: string
): Promise<PaginatedFavoritesResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    // Build query string
    const queryParams = new URLSearchParams();
    
    if (params.q) queryParams.append('q', params.q);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.tags && params.tags.length > 0) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.orderBy) queryParams.append('orderBy', params.orderBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me/favorites${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw await handleApiError(response);
    }

    const apiResponse: FavoritesApiResponse = await response.json();
    
    // Transform API response to normalized format
    return {
      items: apiResponse.favorites.map(fav => fav.tipDetails),
      pageNumber: apiResponse.metadata.pageNumber,
      pageSize: apiResponse.metadata.pageSize,
      totalCount: apiResponse.metadata.totalItems,
      totalPages: apiResponse.metadata.totalPages,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error('Request timeout') as FavoritesApiError;
      timeoutError.status = 0;
      throw timeoutError;
    }
    
    throw error;
  }
}

/**
 * Add a tip to user's favorites
 * 
 * @param tipId - The tip ID to add to favorites
 * @param token - Firebase ID token for authorization
 * @returns Promise that resolves when favorite is added
 * @throws FavoritesApiError if request fails
 */
export async function addFavorite(
  tipId: string,
  token: string
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me/favorites/${tipId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    // 409 Conflict means already favorited - treat as success
    if (response.status === 409) {
      return;
    }

    if (!response.ok) {
      throw await handleApiError(response);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error('Request timeout') as FavoritesApiError;
      timeoutError.status = 0;
      throw timeoutError;
    }
    
    throw error;
  }
}

/**
 * Remove a tip from user's favorites
 * 
 * @param tipId - The tip ID to remove from favorites
 * @param token - Firebase ID token for authorization
 * @returns Promise that resolves when favorite is removed
 * @throws FavoritesApiError if request fails
 */
export async function removeFavorite(
  tipId: string,
  token: string
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me/favorites/${tipId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    // 404 Not Found means already removed - treat as success
    if (response.status === 404) {
      return;
    }

    if (!response.ok) {
      throw await handleApiError(response);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error('Request timeout') as FavoritesApiError;
      timeoutError.status = 0;
      throw timeoutError;
    }
    
    throw error;
  }
}

/**
 * Merge local favorites with server favorites
 * Used when anonymous user signs in
 * 
 * @param tipIds - Array of tip IDs from local storage
 * @param token - Firebase ID token for authorization
 * @returns Promise with merge result summary
 * @throws FavoritesApiError if request fails
 */
export async function mergeFavorites(
  tipIds: string[],
  token: string
): Promise<MergeResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/me/favorites/merge`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tipIds }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw await handleApiError(response);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error('Request timeout') as FavoritesApiError;
      timeoutError.status = 0;
      throw timeoutError;
    }
    
    throw error;
  }
}

/**
 * Handle API errors and convert to FavoritesApiError
 * Extracts RFC 7807 Problem Details and correlation IDs
 * 
 * @param response - Failed fetch response
 * @returns Promise with FavoritesApiError object
 */
async function handleApiError(response: Response): Promise<FavoritesApiError> {
  const contentType = response.headers.get('content-type');
  
  let errorMessage = 'An error occurred';
  let correlationId: string | undefined;
  let detail: string | undefined;

  if (contentType?.includes('application/json') || contentType?.includes('application/problem+json')) {
    try {
      const errorData: ProblemDetails = await response.json();
      
      // Extract correlation ID for logging
      if (errorData.correlationId) {
        correlationId = errorData.correlationId;
        console.error(`[Favorites API Error] Correlation ID: ${correlationId}`);
      }
      
      // Extract detail message
      detail = errorData.detail || errorData.title;
      
      // Handle specific status codes
      switch (response.status) {
        case 401:
          errorMessage = 'Your session has expired. Please sign in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = detail || 'This tip is no longer available.';
          break;
        case 409:
          errorMessage = detail || 'This tip is already in your favorites.';
          break;
        case 500:
          errorMessage = 'Something went wrong. Please try again later.';
          console.error(`[Favorites API Error] Server error: ${detail || 'Unknown'}`);
          break;
        default:
          errorMessage = detail || errorData.title || 'An error occurred';
      }
    } catch (parseError) {
      // Failed to parse JSON error response
      console.error('[Favorites API Error] Failed to parse error response:', parseError);
    }
  }

  const error = new Error(errorMessage) as FavoritesApiError;
  error.status = response.status;
  error.correlationId = correlationId;
  error.detail = detail;
  
  return error;
}
