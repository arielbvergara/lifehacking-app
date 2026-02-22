/**
 * Admin User API Functions
 * 
 * This module provides functions for admin user management operations.
 * All functions require admin authentication via Firebase ID token.
 */

import type {
  PagedUsersResponse,
  FetchUsersParams,
  CreateAdminUserRequest,
} from '@/lib/types/admin-user';
import { handleApiError, createNetworkError } from '@/lib/api/admin-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
const API_TIMEOUT_MS = 30000; // 30 seconds timeout for admin operations

/**
 * Fetch paginated list of users with optional filtering and sorting
 * 
 * @param params - Query parameters for filtering, sorting, and pagination
 * @param idToken - Firebase ID token for admin authentication
 * @returns Promise resolving to paginated users response
 * @throws Error if API request fails
 * 
 * @example
 * const users = await fetchUsers({
 *   search: 'john',
 *   orderBy: UserSortField.Email,
 *   sortDirection: SortDirection.Ascending,
 *   pageNumber: 1,
 *   pageSize: 10,
 * }, idToken);
 */
export async function fetchUsers(
  params: FetchUsersParams,
  idToken: string
): Promise<PagedUsersResponse> {
  const queryParams = new URLSearchParams();

  if (params.search) {
    queryParams.append('search', params.search);
  }
  if (params.orderBy !== undefined) {
    queryParams.append('orderBy', params.orderBy.toString());
  }
  if (params.sortDirection !== undefined) {
    queryParams.append('sortDirection', params.sortDirection.toString());
  }
  if (params.pageNumber) {
    queryParams.append('pageNumber', params.pageNumber.toString());
  }
  if (params.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString());
  }
  if (params.isDeleted !== undefined) {
    queryParams.append('isDeleted', params.isDeleted.toString());
  }

  const url = `${API_BASE_URL}/api/admin/User?${queryParams.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

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
 * Create a new admin user
 * 
 * @param data - User data (email, displayName, password)
 * @param idToken - Firebase ID token for admin authentication
 * @returns Promise resolving when user is created
 * @throws Error if API request fails
 * 
 * @example
 * await createAdminUser({
 *   email: 'admin@example.com',
 *   displayName: 'Admin User',
 *   password: 'SecurePassword123!',
 * }, idToken);
 */
export async function createAdminUser(
  data: CreateAdminUserRequest,
  idToken: string
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/User`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw await handleApiError(response);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw createNetworkError();
    }
    
    throw error;
  }
}

/**
 * Delete a user by ID
 * 
 * @param userId - User ID to delete
 * @param idToken - Firebase ID token for admin authentication
 * @returns Promise resolving when user is deleted
 * @throws Error if API request fails
 * 
 * @example
 * await deleteUser('123e4567-e89b-12d3-a456-426614174000', idToken);
 */
export async function deleteUser(
  userId: string,
  idToken: string
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/User/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw await handleApiError(response);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw createNetworkError();
    }
    
    throw error;
  }
}
