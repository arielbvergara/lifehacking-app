/**
 * Local Storage Manager for anonymous user favorites
 * Handles CRUD operations with graceful error handling
 */

const STORAGE_KEY = 'lifehacking_favorites';

/**
 * Manages favorite tip IDs in browser localStorage
 * Provides graceful degradation when localStorage is unavailable
 */
export class LocalStorageManager {
  /**
   * Get all favorite tip IDs from localStorage
   * @returns Array of tip IDs, empty array if unavailable or corrupted
   */
  getFavorites(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }
      
      const parsed = JSON.parse(stored);
      
      // Validate that parsed data is an array
      if (!Array.isArray(parsed)) {
        console.warn('Favorites data is not an array, initializing empty');
        this.clearFavorites();
        return [];
      }
      
      return parsed;
    } catch (error) {
      // Handle corrupted JSON or localStorage unavailable
      if (error instanceof SyntaxError) {
        console.error('Corrupted favorites data, initializing empty:', error);
        this.clearFavorites();
      } else {
        console.error('localStorage unavailable:', error);
      }
      return [];
    }
  }

  /**
   * Add a tip to favorites
   * @param tipId - The tip ID to add
   */
  addFavorite(tipId: string): void {
    try {
      const favorites = this.getFavorites();
      
      // Avoid duplicates
      if (favorites.includes(tipId)) {
        return;
      }
      
      favorites.push(tipId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded:', error);
        throw new Error('Storage limit reached. Sign in for unlimited favorites.');
      }
      
      console.error('Failed to add favorite:', error);
      throw new Error('Unable to save favorite. Please try again.');
    }
  }

  /**
   * Remove a tip from favorites
   * @param tipId - The tip ID to remove
   */
  removeFavorite(tipId: string): void {
    try {
      const favorites = this.getFavorites();
      const filtered = favorites.filter(id => id !== tipId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      throw new Error('Unable to remove favorite. Please try again.');
    }
  }

  /**
   * Check if a tip is in favorites
   * @param tipId - The tip ID to check
   * @returns True if favorited, false otherwise
   */
  isFavorite(tipId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.includes(tipId);
  }

  /**
   * Clear all favorites (used after merge)
   */
  clearFavorites(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear favorites:', error);
    }
  }

  /**
   * Get count of favorites
   * @returns Number of favorited tips
   */
  getCount(): number {
    return this.getFavorites().length;
  }
}

// Export singleton instance
export const localStorageManager = new LocalStorageManager();
