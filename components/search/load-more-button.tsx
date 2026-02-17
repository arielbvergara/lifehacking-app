'use client';

export interface LoadMoreButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

/**
 * LoadMoreButton Component
 * 
 * Button to fetch and append the next page of results.
 * Displays "Load More Tips" when idle and "Loading..." with a spinner when loading.
 * 
 * @param onClick - Handler called when button is clicked
 * @param loading - Whether the button is in loading state
 * @param disabled - Whether the button is disabled (e.g., all pages loaded)
 * 
 * @example
 * <LoadMoreButton 
 *   onClick={handleLoadMore} 
 *   loading={loadingMore} 
 *   disabled={currentPage >= totalPages} 
 * />
 */
export function LoadMoreButton({ onClick, loading, disabled }: LoadMoreButtonProps) {
  return (
    <div className="flex justify-center py-8">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        type="button"
        className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 px-8 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label={loading ? 'Loading more tips' : 'Load more tips'}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <span 
              className="material-icons-round text-xl animate-spin" 
              aria-hidden="true"
            >
              refresh
            </span>
            Loading...
          </>
        ) : (
          <>
            <span className="material-icons-round text-xl" aria-hidden="true">
              expand_more
            </span>
            Load More Tips
          </>
        )}
      </button>
    </div>
  );
}
