/**
 * API service layer for admin category operations
 */

import {
  CategoryImageDto,
  CreateCategoryRequest,
  CategoryResponse,
} from '@/lib/types/admin-category';
import { UpdateCategoryRequest } from '@/lib/types/admin-dashboard';
import { ADMIN_API_TIMEOUT_MS } from '@/lib/config/api';
import { handleApiError, createNetworkError } from '@/lib/api/admin-utils';

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
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_API_TIMEOUT_MS);

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
      throw createNetworkError();
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
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_API_TIMEOUT_MS);

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
      throw createNetworkError();
    }
    
    throw error;
  }
}

/**
 * Fetch category by ID for editing
 * 
 * @param id - Category ID
 * @param token - Firebase ID token for authorization
 * @returns Promise with category details
 * @throws ApiError if fetch fails
 */
export async function fetchCategoryById(
  id: string,
  token: string
): Promise<CategoryResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/Category/${id}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
        cache: 'no-store', // Always fetch fresh data for admin edit pages
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
      throw createNetworkError();
    }
    
    throw error;
  }
}

/**
 * Update existing category
 * 
 * @param id - Category ID
 * @param data - Category update request data
 * @param token - Firebase ID token for authorization
 * @returns Promise with updated category
 * @throws ApiError if update fails
 */
export async function updateCategory(
  id: string,
  data: UpdateCategoryRequest,
  token: string
): Promise<CategoryResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/categories/${id}`,
      {
        method: 'PUT',
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
      throw createNetworkError();
    }
    
    throw error;
  }
}

/**
 * Soft-delete category
 * 
 * @param id - Category ID
 * @param token - Firebase ID token for authorization
 * @returns Promise that resolves when deletion is complete
 * @throws ApiError if deletion fails
 */
export async function deleteCategory(
  id: string,
  token: string
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/categories/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw await handleApiError(response);
    }

    // 204 No Content - no response body
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw createNetworkError();
    }
    
    throw error;
  }
}
