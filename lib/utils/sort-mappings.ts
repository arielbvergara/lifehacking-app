import { TipSortField, SortDirection } from '@/lib/types/api';

/**
 * Frontend sort option values used in URL parameters
 */
export type SortOption = 'newest' | 'oldest' | 'alphabetical-asc' | 'alphabetical-desc';

/**
 * Mapping structure for converting frontend sort options to backend enum values
 */
export interface SortMapping {
  orderBy: TipSortField;
  sortDirection: SortDirection;
  label: string;
}

/**
 * Maps frontend sort options to backend enum values
 * 
 * - newest: Sort by CreatedAt descending (most recent first)
 * - oldest: Sort by CreatedAt ascending (oldest first)
 * - alphabetical-asc: Sort by Title ascending (A-Z)
 * - alphabetical-desc: Sort by Title descending (Z-A)
 */
export const SORT_MAPPINGS: Record<SortOption, SortMapping> = {
  newest: {
    orderBy: TipSortField.CreatedAt,
    sortDirection: SortDirection.Descending,
    label: 'Newest First',
  },
  oldest: {
    orderBy: TipSortField.CreatedAt,
    sortDirection: SortDirection.Ascending,
    label: 'Oldest First',
  },
  'alphabetical-asc': {
    orderBy: TipSortField.Title,
    sortDirection: SortDirection.Ascending,
    label: 'Alphabetical A-Z',
  },
  'alphabetical-desc': {
    orderBy: TipSortField.Title,
    sortDirection: SortDirection.Descending,
    label: 'Alphabetical Z-A',
  },
};

/**
 * Gets the backend enum mapping for a given sort option
 * 
 * @param sortBy - The frontend sort option
 * @returns The corresponding backend enum values
 */
export function getSortMapping(sortBy: SortOption): SortMapping {
  return SORT_MAPPINGS[sortBy];
}

/**
 * Validates and sanitizes a sortBy URL parameter
 * 
 * @param value - The sortBy value from URL parameters
 * @returns A valid SortOption, defaulting to 'newest' if invalid
 */
export function validateSortBy(value: string | null): SortOption {
  if (
    value === 'newest' || 
    value === 'oldest' || 
    value === 'alphabetical-asc' || 
    value === 'alphabetical-desc'
  ) {
    return value;
  }
  return 'newest';
}

/**
 * Validates and sanitizes a sortDir URL parameter
 * 
 * @param value - The sortDir value from URL parameters
 * @returns A valid sort direction ('asc' or 'desc'), defaulting to 'desc' if invalid
 */
export function validateSortDir(value: string | null): 'asc' | 'desc' {
  if (value === 'asc' || value === 'desc') {
    return value;
  }
  return 'desc';
}

/**
 * Validates and sanitizes a page URL parameter
 * 
 * @param value - The page value from URL parameters
 * @returns A valid page number (>= 1), defaulting to 1 if invalid
 */
export function validatePage(value: string | null): number {
  const page = parseInt(value || '1', 10);
  return isNaN(page) || page < 1 ? 1 : page;
}
