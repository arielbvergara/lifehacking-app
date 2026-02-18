// Favorites System Types
// Based on .kiro/specs/favorites-system/design.md

import { TipSummary } from './api';

// API Request Parameters
export interface GetFavoritesParams {
  q?: string;                    // Search term
  categoryId?: string;           // Category filter
  tags?: string[];               // Tag filters
  orderBy?: TipSortField;        // Sort field
  sortDirection?: SortDirection; // Sort direction
  pageNumber?: number;           // Page number (default: 1)
  pageSize?: number;             // Page size (default: 10)
}

// API Response Types
export interface PaginatedFavoritesResponse {
  items: TipSummary[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface MergeResult {
  addedCount: number;
  skippedCount: number;
  failedCount: number;
  failedTipIds: string[];
}

// Sort Types
export type TipSortField = 'Title' | 'CreatedAt' | 'UpdatedAt';
export type SortDirection = 'Ascending' | 'Descending';

// DTO Types for API requests/responses
export interface MergeFavoritesRequestDto {
  tipIds: string[];  // Array of tip IDs from local storage
}

export interface MergeFavoritesResponseDto {
  addedCount: number;      // Successfully added favorites
  skippedCount: number;    // Already existed (duplicates)
  failedCount: number;     // Invalid or non-existent tip IDs
  failedTipIds: string[];  // List of failed tip IDs
}
