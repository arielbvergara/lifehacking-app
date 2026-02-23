/**
 * Shared utilities for admin API operations
 */

import { ApiError } from '@/lib/types/admin-dashboard';
import { ERROR_MESSAGES } from '@/lib/constants/admin-dashboard';

/**
 * Handle API errors and convert to user-friendly messages
 * 
 * @param response - Failed fetch response
 * @returns Promise with ApiError object
 */
export async function handleApiError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    try {
      const errorData = await response.json();
      
      // Handle specific error cases
      if (response.status === 401) {
        return {
          status: response.status,
          message: ERROR_MESSAGES.SESSION_EXPIRED,
        };
      }
      
      if (response.status === 403) {
        return {
          status: response.status,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        };
      }
      
      if (response.status === 404) {
        if (errorData.detail) {
          console.error('[Admin API Error] 404 detail:', errorData.detail);
        }
        return {
          status: response.status,
          message: ERROR_MESSAGES.GENERIC_ERROR,
        };
      }
      
      if (response.status === 409) {
        if (errorData.detail) {
          console.error('[Admin API Error] 409 detail:', errorData.detail);
        }
        return {
          status: response.status,
          message: ERROR_MESSAGES.CATEGORY_NAME_EXISTS,
        };
      }
      
      if (errorData.detail) {
        console.error('[Admin API Error] detail:', errorData.detail);
      }
      return {
        status: response.status,
        message: ERROR_MESSAGES.GENERIC_ERROR,
        errors: errorData.errors,
      };
    } catch {
      // Failed to parse JSON error response
      return {
        status: response.status,
        message: ERROR_MESSAGES.GENERIC_ERROR,
      };
    }
  }

  // Non-JSON error response
  return {
    status: response.status,
    message: ERROR_MESSAGES.GENERIC_ERROR,
  };
}

/**
 * Create an ApiError for network/timeout errors
 * 
 * @returns ApiError object for network errors
 */
export function createNetworkError(): ApiError {
  return {
    status: 0,
    message: ERROR_MESSAGES.NETWORK_ERROR,
  };
}
