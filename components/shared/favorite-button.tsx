'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/lib/hooks/use-favorites';
import { useToast } from '@/lib/hooks/use-toast';
import { FavoritesLimitError } from '@/lib/errors/favorites-errors';
import { ANONYMOUS_MAX_FAVORITES } from '@/lib/constants/favorites';

export interface FavoriteButtonProps {
  tipId: string;
  tipTitle?: string;                // Optional: for better ARIA labels
  size?: 'sm' | 'md' | 'lg';        // Button size variant
  showLabel?: boolean;              // Show "Favorite" text label
  onToggle?: (isFavorite: boolean) => void; // Callback after toggle
}

const sizeClasses = {
  sm: 'p-1.5 min-w-[36px] min-h-[36px]',
  md: 'p-2 min-w-[44px] min-h-[44px]',
  lg: 'p-3 min-w-[48px] min-h-[48px]',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

/**
 * FavoriteButton component for toggling favorite status on tips
 * 
 * Features:
 * - Optimistic UI updates for immediate feedback
 * - Auth-aware: localStorage for anonymous, API for authenticated users
 * - Loading state with spinner during server requests
 * - Toast notifications for success/error feedback
 * - Accessible: ARIA labels, keyboard support, 44x44px touch target
 * - stopPropagation to prevent parent click handlers
 * 
 * @example
 * <FavoriteButton 
 *   tipId="tip-123" 
 *   tipTitle="How to save time"
 *   size="md"
 *   showLabel={false}
 * />
 */
export function FavoriteButton({
  tipId,
  tipTitle,
  size = 'md',
  showLabel = false,
  onToggle,
}: FavoriteButtonProps) {
  const { isFavorite: checkIsFavorite, addFavorite, removeFavorite } = useFavorites();
  const { showToast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Use hook state as source of truth, fallback to initialIsFavorite
  const isFavorite = checkIsFavorite(tipId);

  const handleClick = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    const newFavoriteState = !isFavorite;

    try {
      if (isFavorite) {
        await removeFavorite(tipId);
        showToast({
          type: 'success',
          message: tipTitle 
            ? `Removed "${tipTitle}" from favorites`
            : 'Removed from favorites',
          duration: 3000,
        });
      } else {
        await addFavorite(tipId);
        showToast({
          type: 'success',
          message: tipTitle 
            ? `Added "${tipTitle}" to favorites`
            : 'Added to favorites',
          duration: 3000,
        });
      }

      // Call onToggle callback if provided
      onToggle?.(newFavoriteState);
    } catch (error) {
      // Check if it's a favorites limit error
      if (error instanceof FavoritesLimitError) {
        showToast({
          type: 'warning',
          message: `You've reached the limit of ${ANONYMOUS_MAX_FAVORITES} favorites. Sign up for unlimited favorites!`,
          duration: 6000,
          action: {
            label: 'Sign Up',
            onClick: () => router.push('/login'),
          },
        });
      } else {
        // Generic error handling
        showToast({
          type: 'error',
          message: isFavorite
            ? 'Failed to remove from favorites'
            : 'Failed to add to favorites',
          duration: 4000,
        });
      }
      console.error('[FavoriteButton] Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  const ariaLabel = isFavorite
    ? tipTitle 
      ? `Remove ${tipTitle} from favorites`
      : 'Remove from favorites'
    : tipTitle
      ? `Add ${tipTitle} to favorites`
      : 'Add to favorites';

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        ${sizeClasses[size]}
        hover:bg-gray-100 rounded-full transition-colors
        flex items-center justify-center gap-2
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        relative
      `}
      aria-label={ariaLabel}
      disabled={isLoading}
      type="button"
    >
      {isLoading ? (
        // Loading spinner
        <svg
          className={`${iconSizeClasses[size]} animate-spin text-gray-400`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : isFavorite ? (
        // Filled heart icon (favorited)
        <svg
          className={`${iconSizeClasses[size]} text-red-500 transition-colors`}
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ) : (
        // Outline heart icon (not favorited)
        <svg
          className={`${iconSizeClasses[size]} text-gray-400 hover:text-red-500 transition-colors`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
      
      {showLabel && !isLoading && (
        <span className="text-sm font-medium text-gray-700">
          {isFavorite ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  );
}
