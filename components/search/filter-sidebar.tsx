'use client';

import { useEffect, useRef } from 'react';
import type { SortOption } from '@/lib/utils/sort-mappings';
import { CategoryFilterBar } from './category-filter-bar';
import { ResetFiltersButton } from './reset-filters-button';
import { SortFieldDropdown } from './sort-field-dropdown';
import { SortDirectionToggle } from './sort-direction-toggle';

export interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  sortBy: SortOption;
  sortDir: 'asc' | 'desc';
  onSortChange: (sortBy: SortOption) => void;
  onSortDirectionToggle: () => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  showCategoryFilter: boolean;
}

/**
 * FilterSidebar Component
 * 
 * Container for all filter controls including reset button, sort dropdown, and sort direction toggle.
 * On desktop (≥768px): Fixed sidebar always visible on the left side
 * On mobile (<768px): Slide-in panel controlled by isOpen prop
 * 
 * @param isOpen - Mobile only: sidebar visibility state
 * @param onClose - Mobile only: handler to close the sidebar
 * @param selectedCategoryId - Currently selected category ID (null for "All")
 * @param onCategorySelect - Handler for category selection
 * @param sortBy - Current sort option
 * @param sortDir - Current sort direction
 * @param onSortChange - Handler for sort option change
 * @param onSortDirectionToggle - Handler for sort direction toggle
 * @param onResetFilters - Handler for reset filters button
 * @param hasActiveFilters - Whether any filters are currently active
 * @param showCategoryFilter - Whether to show category filter (true on mobile, false on desktop)
 * 
 * @example
 * <FilterSidebar
 *   isOpen={sidebarOpen}
 *   onClose={() => setSidebarOpen(false)}
 *   selectedCategoryId={categoryId}
 *   onCategorySelect={handleCategorySelect}
 *   sortBy="newest"
 *   sortDir="desc"
 *   onSortChange={handleSortChange}
 *   onSortDirectionToggle={handleSortDirectionToggle}
 *   onResetFilters={handleResetFilters}
 *   hasActiveFilters={true}
 *   showCategoryFilter={false}
 * />
 */
export function FilterSidebar({
  isOpen,
  onClose,
  selectedCategoryId,
  onCategorySelect,
  sortBy,
  sortDir,
  onSortChange,
  onSortDirectionToggle,
  onResetFilters,
  hasActiveFilters,
  showCategoryFilter,
}: FilterSidebarProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key to close sidebar on mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus management: move focus to close button when sidebar opens, restore when it closes
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Move focus to close button (first interactive element in sidebar)
      // Use setTimeout to ensure the sidebar is rendered and visible
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else {
      // Restore focus to the element that opened the sidebar
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [isOpen]);

  // Disable sort direction toggle when alphabetical is selected
  const isSortDirectionDisabled = sortBy === 'alphabetical';

  return (
    <>
      {/* Overlay for mobile - only renders when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static
          top-0 left-0 bottom-0
          w-[280px] md:w-[260px]
          bg-white
          z-50
          transition-transform duration-300 ease-in-out
          md:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          overflow-y-auto
          md:rounded-xl md:shadow-sm md:border md:border-gray-200
          flex-shrink-0
        `}
        role="complementary"
        aria-label="Filter sidebar"
      >
        {/* Sidebar Header */}
        <div className="sticky top-0 bg-white md:rounded-t-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          
          {/* Close button - mobile only */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close filters"
            type="button"
          >
            <span className="material-icons-round text-gray-600">close</span>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="p-6 space-y-6">
          {/* Category Filter - mobile only, vertical layout */}
          {showCategoryFilter && (
            <div className="md:hidden">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Categories</h3>
              <CategoryFilterBar
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={onCategorySelect}
                variant="vertical"
              />
            </div>
          )}

          {/* Reset Filters Button */}
          <ResetFiltersButton
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
          />

          {/* Sort Field Dropdown */}
          <SortFieldDropdown
            value={sortBy}
            onChange={onSortChange}
          />

          {/* Sort Direction Toggle */}
          <SortDirectionToggle
            value={sortDir}
            onChange={onSortDirectionToggle}
            disabled={isSortDirectionDisabled}
          />
        </div>
      </aside>
    </>
  );
}
