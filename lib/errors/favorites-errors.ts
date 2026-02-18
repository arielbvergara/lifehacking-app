/**
 * Custom error classes for favorites operations
 */

/**
 * Error thrown when anonymous user tries to exceed favorites limit
 */
export class FavoritesLimitError extends Error {
  constructor(limit: number) {
    super(`Anonymous users can only save up to ${limit} favorites. Sign up for unlimited favorites!`);
    this.name = 'FavoritesLimitError';
  }
}
