'use client';

export interface MobileFilterButtonProps {
  onClick: () => void;
  activeFilterCount: number;
  isOpen: boolean;
}

/**
 * MobileFilterButton Component
 * 
 * Toggle button for opening the filter sidebar on mobile devices.
 * Displays a "Filters" button with an optional badge showing the count of active filters.
 * Only rendered on mobile viewports (<768px).
 * 
 * @param onClick - Handler called when the button is clicked
 * @param activeFilterCount - Number of active filters (shows badge when > 0)
 * @param isOpen - Whether the filter sidebar is currently open
 * 
 * @example
 * <MobileFilterButton onClick={handleOpenSidebar} activeFilterCount={2} isOpen={false} />
 */
export function MobileFilterButton({ onClick, activeFilterCount, isOpen }: MobileFilterButtonProps) {
  const showBadge = activeFilterCount > 0;

  return (
    <button
      onClick={onClick}
      type="button"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 md:hidden flex items-center gap-2 bg-primary text-white font-semibold px-6 py-4 rounded-full shadow-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[44px]"
      aria-label={`Open filters${showBadge ? ` (${activeFilterCount} active)` : ''}`}
      aria-expanded={isOpen}
    >
      {/* Filter Icon */}
      <svg
        className="w-5 h-5"
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
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
      
      {/* Button Text */}
      <span>Filters</span>
      
      {/* Active Filter Count Badge */}
      {showBadge && (
        <span
          className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-red-500 text-white text-xs font-bold rounded-full"
          aria-label={`${activeFilterCount} active filters`}
        >
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}
