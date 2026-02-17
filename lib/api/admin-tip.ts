/**
 * API service layer for admin tip operations
 */

import {
  TipImageDto,
  CreateTipRequest,
  TipDetailResponse,
  CategoryResponse,
  ApiError,
} from '@/lib/types/admin-tip';
import { API_TIMEOUT_MS, ERROR_MESSAGES } from '@/lib/constants/admin-tip';

/**
 * Upload tip image to S3
 * 
 * @param file - The image file to upload
 * @param token - Firebase ID token for authorization
 * @returns Promise with image metadata
 * @throws ApiError if upload fails
 */
export async function uploadTipImage(
  file: File,
  token: string
): Promise<TipImageDto> {
  const formData = new FormData();
  formData.append('file', file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/tips/images`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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
      throw {
        status: 0,
        message: ERROR_MESSAGES.NETWORK_ERROR,
      } as ApiError;
    }
    
    throw error;
  }
}

/**
 * Create tip with all details
 * 
 * @param data - Tip creation request data
 * @param token - Firebase ID token for authorization
 * @returns Promise with created tip
 * @throws ApiError if creation fails
 */
export async function createTip(
  data: CreateTipRequest,
  token: string
): Promise<TipDetailResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/tips`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
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
      throw {
        status: 0,
        message: ERROR_MESSAGES.NETWORK_ERROR,
      } as ApiError;
    }
    
    throw error;
  }
}

/**
 * Fetch all categories
 * 
 * @returns Promise with list of categories
 * @throws ApiError if fetch fails
 */
export async function fetchCategories(): Promise<CategoryResponse[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/Category`,
      {
        method: 'GET',
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw await handleApiError(response);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw {
        status: 0,
        message: ERROR_MESSAGES.NETWORK_ERROR,
      } as ApiError;
    }
    
    throw error;
  }
}

/**
 * Handle API errors and convert to user-friendly messages
 * 
 * @param response - Failed fetch response
 * @returns Promise with ApiError object
 */
async function handleApiError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    try {
      const errorData = await response.json();
      
      // Handle specific error cases
      if (response.status === 403) {
        return {
          status: response.status,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        };
      }
      
      if (response.status === 404) {
        return {
          status: response.status,
          message: errorData.detail || ERROR_MESSAGES.CATEGORY_NOT_FOUND,
        };
      }
      
      return {
        status: response.status,
        message: errorData.detail || errorData.title || ERROR_MESSAGES.GENERIC_ERROR,
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
