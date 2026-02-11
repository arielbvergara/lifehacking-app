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
