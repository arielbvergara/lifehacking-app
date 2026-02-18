'use client';

/**
 * Favorites Context Provider
 * Provides global favorites state to avoid multiple API calls
 * 
 * - Single source of truth for favorites across the app
 * - One API call per page load instead of per component
 * - Optimistic updates propagate to all consumers
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { localStorageManager } from '@/lib/storage/favorites-storage';
import * as favoritesApi from '@/lib/api/favorites';
import { ANONYMOUS_MAX_FAVORITES } from '@/lib/constants/favorites';
import { FavoritesLimitError } from '@/lib/errors/favorites-errors';
import { registerFavoritesRefresh, unregisterFavoritesRefresh } from '@/lib/favorites/merge-handler';

export interface FavoritesContextValue {
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

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export interface FavoritesProviderProps {
  children: ReactNode;
}

/**
 * Favorites Provider Component
 * Wraps the app to provide global favorites state
 */
export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { user, idToken } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load favorites based on auth state
   * - Authenticated: Fetch from server
   * - Anonymous: Load from localStorage
   */
  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (user && idToken) {
        // Authenticated user: fetch from server
        const response = await favoritesApi.getFavorites({}, idToken);
        const tipIds = response.items.map(tip => tip.id);
        setFavorites(tipIds);
      } else {
        // Anonymous user: load from localStorage
        const localFavorites = localStorageManager.getFavorites();
        setFavorites(localFavorites);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to load favorites');
      setError(errorMessage);
      console.error('[FavoritesContext] Error loading favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, idToken]);

  /**
   * Load favorites on mount and when auth state changes
   */
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  /**
   * Register refresh callback for merge handler
   * This allows the merge handler to trigger a refresh after merging
   */
  useEffect(() => {
    registerFavoritesRefresh(loadFavorites);
    
    return () => {
      unregisterFavoritesRefresh();
    };
  }, [loadFavorites]);

  /**
   * Add a tip to favorites with optimistic update
   */
  const addFavorite = useCallback(async (tipId: string) => {
    const previousFavorites = [...favorites];

    // Check limit for anonymous users
    if (!user && favorites.length >= ANONYMOUS_MAX_FAVORITES) {
      throw new FavoritesLimitError(ANONYMOUS_MAX_FAVORITES);
    }

    // Optimistic update
    if (!favorites.includes(tipId)) {
      setFavorites(prev => [...prev, tipId]);
    }

    try {
      if (user && idToken) {
        await favoritesApi.addFavorite(tipId, idToken);
      } else {
        localStorageManager.addFavorite(tipId);
      }
    } catch (err) {
      // Rollback on error
      setFavorites(previousFavorites);
      
      const errorMessage = err instanceof Error ? err : new Error('Failed to add favorite');
      setError(errorMessage);
      console.error('[FavoritesContext] Error adding favorite:', err);
      
      throw errorMessage;
    }
  }, [favorites, user, idToken]);

  /**
   * Remove a tip from favorites with optimistic update
   */
  const removeFavorite = useCallback(async (tipId: string) => {
    const previousFavorites = [...favorites];

    // Optimistic update
    setFavorites(prev => prev.filter(id => id !== tipId));

    try {
      if (user && idToken) {
        await favoritesApi.removeFavorite(tipId, idToken);
      } else {
        localStorageManager.removeFavorite(tipId);
      }
    } catch (err) {
      // Rollback on error
      setFavorites(previousFavorites);
      
      const errorMessage = err instanceof Error ? err : new Error('Failed to remove favorite');
      setError(errorMessage);
      console.error('[FavoritesContext] Error removing favorite:', err);
      
      throw errorMessage;
    }
  }, [favorites, user, idToken]);

  /**
   * Check if a tip is in favorites
   */
  const isFavorite = useCallback((tipId: string): boolean => {
    return favorites.includes(tipId);
  }, [favorites]);

  /**
   * Refresh favorites from storage/server
   */
  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  const value: FavoritesContextValue = {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites,
    count: favorites.length,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

/**
 * Hook to access favorites context
 * Must be used within FavoritesProvider
 */
export function useFavoritesContext(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  
  if (context === undefined) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  
  return context;
}
