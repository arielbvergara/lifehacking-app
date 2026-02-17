'use client';

import type { SortOption } from '@/lib/utils/sort-mappings';

export interface SortFieldDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

/**
 * Sort options for the dropdown
 */
const SORT_OPTIONS = [
  { value: 'newest' as const, label: 'Newest First' },
  { value: 'oldest' as const, label: 'Oldest First' },
  { value: 'alphabetical' as const, label: 'Alphabetical A-Z' },
];

/**
 * SortFieldDropdown Component
 * 
 * Dropdown for selecting sort field (Newest/Oldest/Alphabetical).
 * Uses a native select element for accessibility.
 * 
 * @param value - Currently selected sort option
 * @param onChange - Handler called when selection changes
 * 
 * @example
 * <SortFieldDropdown 
 *   value="newest" 
 *   onChange={(value) => handleSortChange(value)} 
 * />
 */
export function SortFieldDropdown({ value, onChange }: SortFieldDropdownProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as SortOption);
  };

  return (
    <div className="w-full">
      <label 
        htmlFor="sort-by" 
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Sort By
      </label>
      <select
        id="sort-by"
        value={value}
        onChange={handleChange}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors hover:border-gray-400"
        aria-label="Sort tips by"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
