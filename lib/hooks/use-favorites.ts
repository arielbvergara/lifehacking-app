'use client';

/**
 * Custom hook for managing user favorites
 * Now uses FavoritesContext for global state management
 * 
 * This is a convenience wrapper around useFavoritesContext
 * that maintains backward compatibility with existing code.
 */

import { useFavoritesContext } from '@/lib/context/favorites-context';

export interface UseFavoritesReturn {
  // State
  favorites: string[];           // Array of favorited tip IDs
  isLoading: boolean;
  error: Error | null;
  
  // Operations
  addFavorite: (tipId: string) => Promise<void>;
  removeFavorite: (tipId: string) => Promise<void>;
  isFavorite: (tipId: string) => boolean;
  refreshFavorites: () => Promise<void>;
  
  // Metadata
  count: number;
}

/**
 * Hook for managing user favorites with auth-aware storage
 * 
 * Uses global FavoritesContext to avoid multiple API calls.
 * All components share the same favorites state.
 * 
 * @returns Favorites state and operations
 * 
 * @example
 * function MyComponent() {
 *   const { favorites, addFavorite, isFavorite, count } = useFavorites();
 *   
 *   return (
 *     <div>
 *       <p>You have {count} favorites</p>
 *       <button onClick={() => addFavorite('tip-123')}>
 *         {isFavorite('tip-123') ? 'Remove' : 'Add'}
 *       </button>
 *     </div>
 *   );
 * }
 */
export function useFavorites(): UseFavoritesReturn {
  return useFavoritesContext();
}
