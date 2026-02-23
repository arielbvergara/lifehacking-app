/**
 * API service layer for admin tip operations
 */

import {
  TipImageDto,
  CreateTipRequest,
  TipDetailResponse,
  CategoryResponse,
} from '@/lib/types/admin-tip';
import { UpdateTipRequest } from '@/lib/types/admin-dashboard';
import { ADMIN_API_TIMEOUT_MS } from '@/lib/config/api';
import { handleApiError, createNetworkError } from '@/lib/api/admin-utils';

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
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_API_TIMEOUT_MS);

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
      throw createNetworkError();
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
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_API_TIMEOUT_MS);

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
      throw createNetworkError();
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
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_API_TIMEOUT_MS);

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
      throw createNetworkError();
    }
    
    throw error;
  }
}

/**
 * Fetch tip by ID for editing
 * 
 * @param id - Tip ID
 * @param token - Firebase ID token for authorization
 * @returns Promise with tip details
 * @throws ApiError if fetch fails
 */
export async function fetchTipById(
  id: string,
  token: string
): Promise<TipDetailResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/Tip/${id}`,
      {
        method: 'GET',
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
 * Update existing tip
 * 
 * @param id - Tip ID
 * @param data - Tip update request data
 * @param token - Firebase ID token for authorization
 * @returns Promise with updated tip
 * @throws ApiError if update fails
 */
export async function updateTip(
  id: string,
  data: UpdateTipRequest,
  token: string
): Promise<TipDetailResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/tips/${id}`,
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
 * Soft-delete tip
 * 
 * @param id - Tip ID
 * @param token - Firebase ID token for authorization
 * @returns Promise that resolves when deletion is complete
 * @throws ApiError if deletion fails
 */
export async function deleteTip(
  id: string,
  token: string
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/tips/${id}`,
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
