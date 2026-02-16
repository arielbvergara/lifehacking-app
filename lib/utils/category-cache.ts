import { Category } from '@/lib/types/api';

/**
 * Session storage key for caching category data.
 */
const CACHE_KEY = 'categories_cache';

/**
 * Structure of the cached category data in session storage.
 */
interface CachedCategoryData {
  categories: Category[];
  timestamp: number;
}

/**
 * Retrieves cached categories from session storage.
 * Returns null if no cache exists or if there's an error reading from storage.
 * 
 * @returns Array of cached categories, or null if cache is empty or unavailable
 * 
 * @example
 * const categories = getCachedCategories();
 * if (categories) {
 *   // Use cached categories
 * } else {
 *   // Fetch from API
 * }
 */
export function getCachedCategories(): Category[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) {
      return null;
    }
    
    const data: CachedCategoryData = JSON.parse(cached);
    return data.categories;
  } catch {
    // Silent failure - return null if storage is unavailable or data is corrupted
    return null;
  }
}

/**
 * Stores categories in session storage for the duration of the browser session.
 * Fails silently if session storage is unavailable (e.g., in private browsing mode).
 * 
 * @param categories - Array of categories to cache
 * 
 * @example
 * const categories = await fetchCategories();
 * setCachedCategories(categories);
 */
export function setCachedCategories(categories: Category[]): void {
  try {
    const data: CachedCategoryData = {
      categories,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Silent failure - caching is an optimization, not a requirement
    // This handles cases like:
    // - Private browsing mode where storage is disabled
    // - Storage quota exceeded
    // - SecurityError in certain contexts
  }
}
