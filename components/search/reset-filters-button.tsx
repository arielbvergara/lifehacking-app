'use client';

interface ResetFiltersButtonProps {
  onClick: () => void;
  disabled: boolean;
}

/**
 * ResetFiltersButton Component
 * 
 * Button to clear all filters and return to default search state.
 * Displays "Reset All Filters" text with a reset icon.
 * 
 * @param onClick - Handler called when button is clicked
 * @param disabled - Whether the button is disabled (no active filters)
 * 
 * @example
 * <ResetFiltersButton 
 *   onClick={handleReset} 
 *   disabled={!hasActiveFilters} 
 * />
 */
export function ResetFiltersButton({ onClick, disabled }: ResetFiltersButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="md:hidden w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      type="button"
      aria-label="Reset all filters"
    >
      <span className="material-icons-round text-xl" aria-hidden="true">
        restart_alt
      </span>
      Reset All Filters
    </button>
  );
}
