/**
 * Admin User Management Types
 * 
 * Type definitions for admin user management operations.
 * Based on the OpenAPI schema for /api/admin/User endpoints.
 */

/**
 * Sort fields for user queries
 */
export enum UserSortField {
  Email = 0,
  Name = 1,
  CreatedAt = 2,
}

/**
 * Sort direction for queries
 */
export enum SortDirection {
  Ascending = 0,
  Descending = 1,
}

/**
 * User summary for list display
 */
export interface UserSummary {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt?: string;
  isDeleted?: boolean;
}

/**
 * Pagination metadata
 */
export interface PaginationMetadata {
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Paginated users response
 */
export interface PagedUsersResponse {
  items: UserSummary[];
  pagination: PaginationMetadata;
}

/**
 * Request payload for creating an admin user
 */
export interface CreateAdminUserRequest {
  email: string;
  displayName: string;
  password: string;
}

/**
 * Query parameters for fetching users
 */
export interface FetchUsersParams {
  search?: string;
  orderBy?: UserSortField;
  sortDirection?: SortDirection;
  pageNumber?: number;
  pageSize?: number;
  isDeleted?: boolean;
}
