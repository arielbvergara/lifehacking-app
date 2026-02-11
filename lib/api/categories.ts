// API client for category-related endpoints

import { API_BASE_URL } from '../config/api';
import type { CategoryListResponse } from '../types/api';
import { fetchWithTimeout } from './utils';

export { APIError } from './utils';

/**
 * Fetches all categories from the API
 * @returns Promise resolving to an array of categories
 * @throws {APIError} When the API returns an error response
 * @throws {Error} When the request times out or network fails
 */
export async function fetchCategories(): Promise<CategoryListResponse> {
  return fetchWithTimeout<CategoryListResponse>(
    `${API_BASE_URL}/api/Category`
  );
}
