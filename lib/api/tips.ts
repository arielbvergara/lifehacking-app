// API client for tip-related endpoints

import { API_BASE_URL } from '../config/api';
import type {
  PagedTipsResponse,
  TipDetail,
  TipSortField,
  SortDirection,
} from '../types/api';
import { fetchWithTimeout } from './utils';

export { APIError } from './utils';

/**
 * Parameters for fetching tips
 */
export interface FetchTipsParams {
  q?: string;
  categoryId?: string;
  tags?: string[];
  orderBy?: TipSortField;
  sortDirection?: SortDirection;
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Fetches tips from the API with optional filtering, sorting, and pagination
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to paginated tips response
 * @throws {APIError} When the API returns an error response
 * @throws {Error} When the request times out or network fails
 */
export async function fetchTips(
  params: FetchTipsParams = {}
): Promise<PagedTipsResponse> {
  const queryParams = new URLSearchParams();

  if (params.q) queryParams.append('q', params.q);
  if (params.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params.tags) params.tags.forEach((tag) => queryParams.append('tags', tag));
  if (params.orderBy !== undefined)
    queryParams.append('orderBy', params.orderBy.toString());
  if (params.sortDirection !== undefined)
    queryParams.append('sortDirection', params.sortDirection.toString());
  if (params.pageNumber)
    queryParams.append('pageNumber', params.pageNumber.toString());
  if (params.pageSize)
    queryParams.append('pageSize', params.pageSize.toString());

  const url = `${API_BASE_URL}/api/Tip${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return fetchWithTimeout<PagedTipsResponse>(url);
}

/**
 * Fetches a single tip by ID
 * @param id - The UUID of the tip to fetch
 * @returns Promise resolving to the tip detail
 * @throws {APIError} When the API returns an error response
 * @throws {Error} When the request times out or network fails
 */
export async function fetchTipById(id: string): Promise<TipDetail> {
  return fetchWithTimeout<TipDetail>(`${API_BASE_URL}/api/Tip/${id}`);
}

/**
 * Fetches tips from a specific category with pagination support
 * 
 * This function is used to retrieve related tips from the same category,
 * typically for displaying "More like this" sections on tip detail pages.
 * 
 * @param categoryId - The UUID of the category to fetch tips from
 * @param params - Query parameters for sorting and pagination
 * @param params.pageNumber - Page number (1-indexed, default: 1)
 * @param params.pageSize - Number of items per page (default: 10, max: 100)
 * @param params.orderBy - Sort field (CreatedAt: 0, UpdatedAt: 1, Title: 2)
 * @param params.sortDirection - Sort direction (Ascending: 0, Descending: 1)
 * @returns Promise resolving to paginated tips response with items and metadata
 * @throws {APIError} When the API returns an error response (400, 404, 500)
 * @throws {Error} When the request times out or network fails
 * 
 * @example
 * // Fetch 5 most recent tips from a category
 * const response = await fetchTipsByCategory('123e4567-e89b-12d3-a456-426614174000', {
 *   pageSize: 5,
 *   orderBy: TipSortField.CreatedAt,
 *   sortDirection: SortDirection.Descending,
 * });
 * 
 * @example
 * // Fetch tips with pagination
 * const response = await fetchTipsByCategory('123e4567-e89b-12d3-a456-426614174000', {
 *   pageNumber: 2,
 *   pageSize: 10,
 * });
 */
export async function fetchTipsByCategory(
  categoryId: string,
  params: FetchTipsParams = {}
): Promise<PagedTipsResponse> {
  const queryParams = new URLSearchParams();

  if (params.pageNumber)
    queryParams.append('pageNumber', params.pageNumber.toString());
  if (params.pageSize)
    queryParams.append('pageSize', params.pageSize.toString());
  if (params.orderBy !== undefined)
    queryParams.append('orderBy', params.orderBy.toString());
  if (params.sortDirection !== undefined)
    queryParams.append('sortDirection', params.sortDirection.toString());

  const url = `${API_BASE_URL}/api/Category/${categoryId}/tips?${queryParams.toString()}`;
  return fetchWithTimeout<PagedTipsResponse>(url);
}
