/**
 * API client for admin dashboard statistics
 */

import { API_TIMEOUT_MS } from '@/lib/constants/admin-dashboard';
import type { DashboardResponse } from '@/lib/types/admin-dashboard';
import { handleApiError, createNetworkError } from '@/lib/api/admin-utils';

/**
 * Fetch dashboard statistics from the admin API
 * 
 * @param token - Firebase authentication token
 * @returns Promise with dashboard statistics
 * @throws ApiError on failure
 */
export async function fetchDashboardStatistics(
  token: string
): Promise<DashboardResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/dashboard`,
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
