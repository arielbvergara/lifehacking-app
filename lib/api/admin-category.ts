/**
 * API service layer for admin category operations
 */

import {
  CategoryImageDto,
  CreateCategoryRequest,
  CategoryResponse,
  ApiError,
} from '@/lib/types/admin-category';
import { API_TIMEOUT_MS, ERROR_MESSAGES } from '@/lib/constants/admin-category';

/**
 * Upload category image to S3
 * 
 * @param file - The image file to upload
 * @param token - Firebase ID token for authorization
 * @returns Promise with image metadata
 * @throws ApiError if upload fails
 */
export async function uploadCategoryImage(
  file: File,
  token: string
): Promise<CategoryImageDto> {
  const formData = new FormData();
  formData.append('file', file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/categories/images`,
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
 * Create category with image metadata
 * 
 * @param data - Category creation request data
 * @param token - Firebase ID token for authorization
 * @returns Promise with created category
 * @throws ApiError if creation fails
 */
export async function createCategory(
  data: CreateCategoryRequest,
  token: string
): Promise<CategoryResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/categories`,
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
      
      if (response.status === 409) {
        // Extract category name from error detail if available
        const detail = errorData.detail || '';
        const nameMatch = detail.match(/Category with name '([^']+)'/);
        const categoryName = nameMatch ? nameMatch[1] : 'this name';
        
        return {
          status: response.status,
          message: ERROR_MESSAGES.CATEGORY_EXISTS(categoryName),
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
