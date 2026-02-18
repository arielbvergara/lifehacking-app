'use client';

import { useEffect, useRef } from 'react';
import type { SortOption } from '@/lib/utils/sort-mappings';
import { ResetFiltersButton } from './reset-filters-button';
import { SortFieldDropdown } from './sort-field-dropdown';
import { FilterTag } from './filter-tag';

export interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategoryId: string | null;
  selectedCategoryName: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  searchQuery: string;
  onSearchQueryRemove: () => void;
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  showCategoryFilter: boolean;
}

/**
 * FilterSidebar Component
 * 
 * Container for all filter controls including active filter tags, reset button, sort dropdown, and sort direction toggle.
 * On desktop (≥768px): Fixed sidebar always visible on the left side
 * On mobile (<768px): Slide-in panel controlled by isOpen prop
 * 
 * @param isOpen - Mobile only: sidebar visibility state
 * @param onClose - Mobile only: handler to close the sidebar
 * @param selectedCategoryId - Currently selected category ID (null for "All")
 * @param selectedCategoryName - Currently selected category name (null for "All")
 * @param onCategorySelect - Handler for category selection
 * @param searchQuery - Current search query string
 * @param onSearchQueryRemove - Handler to clear search query
 * @param sortBy - Current sort option
 * @param onSortChange - Handler for sort option change
 * @param onResetFilters - Handler for reset filters button
 * @param hasActiveFilters - Whether any filters are currently active
 * @param showCategoryFilter - Whether to show category filter (true on mobile, false on desktop)
 * 
 * @example
 * <FilterSidebar
 *   isOpen={sidebarOpen}
 *   onClose={() => setSidebarOpen(false)}
 *   selectedCategoryId={categoryId}
 *   selectedCategoryName="Technology"
 *   onCategorySelect={handleCategorySelect}
 *   searchQuery="productivity"
 *   onSearchQueryRemove={handleSearchQueryRemove}
 *   sortBy="newest"
 *   onSortChange={handleSortChange}
 *   onResetFilters={handleResetFilters}
 *   hasActiveFilters={true}
 *   showCategoryFilter={false}
 * />
 */
export function FilterSidebar({
  isOpen,
  onClose,
  selectedCategoryId,
  selectedCategoryName,
  onCategorySelect,
  searchQuery,
  onSearchQueryRemove,
  sortBy,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
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
          z-50 md:z-0
          transition-transform duration-300 ease-in-out
          md:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          overflow-y-auto
          md:overflow-visible
          md:rounded-xl md:shadow-sm md:border md:border-gray-200
          flex-shrink-0
          md:h-fit md:sticky md:top-8
        `}
        role="complementary"
        aria-label="Filter sidebar"
      >
        {/* Sidebar Header */}
        <div className="sticky top-0 bg-white md:rounded-t-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 md:z-0">
          <div className="flex items-center gap-3">
            {/* Filter Icon */}
            <span className="material-icons-round text-primary text-2xl">tune</span>
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Reset text button - visible on desktop */}
            <button
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
              className={`hidden md:block text-sm font-medium transition-colors ${
                hasActiveFilters
                  ? 'text-gray-600 hover:text-gray-900'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              type="button"
            >
              Reset
            </button>
            
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
        </div>

        {/* Sidebar Content */}
        <div className="p-6 space-y-6">
          
          {/* Active Filter Tags */}
          {(selectedCategoryId || searchQuery) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Filters</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCategoryId && selectedCategoryName && (
                  <FilterTag
                    label={selectedCategoryName}
                    onRemove={() => onCategorySelect(null)}
                    type="category"
                  />
                )}
                {searchQuery && (
                  <FilterTag
                    label={`"${searchQuery}"`}
                    onRemove={onSearchQueryRemove}
                    type="search"
                  />
                )}
              </div>
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
        </div>
      </aside>
    </>
  );
}
