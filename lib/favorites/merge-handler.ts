/**
 * Favorites Merge Handler
 * Handles automatic merging of local favorites when user logs in
 */

import { localStorageManager } from '@/lib/storage/favorites-storage';
import { mergeFavorites } from '@/lib/api/favorites';
import { addToast } from '@/lib/hooks/use-toast';

// Global callback for refreshing favorites after merge
let refreshCallback: (() => Promise<void>) | null = null;

/**
 * Register a callback to refresh favorites after merge
 * This is called by FavoritesContext on mount
 */
export function registerFavoritesRefresh(callback: () => Promise<void>) {
  refreshCallback = callback;
}

/**
 * Unregister the refresh callback
 * This is called by FavoritesContext on unmount
 */
export function unregisterFavoritesRefresh() {
  refreshCallback = null;
}

/**
 * Handle favorites merge on user login
 * Merges local favorites with server favorites and clears local storage on success
 * 
 * @param idToken - Firebase ID token for authorization
 * @returns Promise that resolves when merge is complete or skipped
 */
export async function handleFavoritesMerge(idToken: string): Promise<void> {
  // 1. Get local favorites
  const localFavorites = localStorageManager.getFavorites();
  
  // 2. Skip merge if no local favorites
  if (localFavorites.length === 0) {
    return;
  }
  
  try {
    // 3. Call merge API
    const result = await mergeFavorites(localFavorites, idToken);
    
    // 4. Clear local storage on success
    localStorageManager.clearFavorites();
    
    // 5. Refresh favorites context to update count
    if (refreshCallback) {
      await refreshCallback();
    }
    
    // 6. Show success toast with summary
    addToast({
      type: 'success',
      message: `Merged ${result.addedCount} favorite${result.addedCount !== 1 ? 's' : ''} to your account`,
      duration: 5000,
    });
    
    // 7. Show warning toast if there were failures
    if (result.failedCount > 0) {
      addToast({
        type: 'warning',
        message: `${result.failedCount} favorite${result.failedCount !== 1 ? 's' : ''} could not be merged`,
        duration: 5000,
      });
    }
  } catch (error) {
    // Keep local favorites on error
    console.error('[Favorites Merge] Failed to merge favorites:', error);
    
    addToast({
      type: 'error',
      message: 'Failed to merge favorites. They are still saved locally.',
      duration: 5000,
    });
  }
}
