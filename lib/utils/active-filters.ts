/**
 * Calculates the number of active (non-default) filters from URL search parameters
 * 
 * Active filters include:
 * - q: Search query (any non-empty value)
 * - categoryId: Selected category (any value)
 * - sortBy: Sort option (if not 'newest', the default)
 * - sortDir: Sort direction (if not 'desc', the default)
 * 
 * @param params - URLSearchParams object containing filter parameters
 * @returns The count of active filters
 * 
 * @example
 * const params = new URLSearchParams('q=cooking&categoryId=123');
 * calculateActiveFilters(params); // Returns 2
 * 
 * @example
 * const params = new URLSearchParams('sortBy=newest&sortDir=desc');
 * calculateActiveFilters(params); // Returns 0 (both are defaults)
 */
export function calculateActiveFilters(params: URLSearchParams): number {
  let count = 0;

  // Count search query if present
  if (params.get('q')) {
    count++;
  }

  // Count category filter if present
  if (params.get('categoryId')) {
    count++;
  }

  // Count sort option if not default (newest)
  const sortBy = params.get('sortBy');
  if (sortBy && sortBy !== 'newest') {
    count++;
  }

  // Count sort direction if not default (desc)
  const sortDir = params.get('sortDir');
  if (sortDir && sortDir !== 'desc') {
    count++;
  }

  return count;
}
