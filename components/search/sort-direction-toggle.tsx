'use client';

export interface SortDirectionToggleProps {
  value: 'asc' | 'desc';
  onChange: () => void;
  disabled: boolean;
}

/**
 * SortDirectionToggle Component
 * 
 * Toggle button for switching between ascending and descending sort order.
 * Displays an up arrow (↑) for ascending and down arrow (↓) for descending.
 * 
 * @param value - Current sort direction ('asc' or 'desc')
 * @param onChange - Handler called when toggle is clicked
 * @param disabled - Whether the toggle is disabled (e.g., when Alphabetical A-Z is selected)
 * 
 * @example
 * <SortDirectionToggle 
 *   value="desc" 
 *   onChange={handleToggle} 
 *   disabled={sortBy === 'alphabetical'} 
 * />
 */
export function SortDirectionToggle({ value, onChange, disabled }: SortDirectionToggleProps) {
  const isAscending = value === 'asc';
  const icon = isAscending ? '↑' : '↓';
  const text = isAscending ? 'Ascending' : 'Descending';

  return (
    <div className="w-full">
      <label 
        htmlFor="sort-direction" 
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Sort Direction
      </label>
      <button
        id="sort-direction"
        onClick={onChange}
        disabled={disabled}
        type="button"
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label={`Sort direction: ${text}. Click to toggle.`}
        aria-pressed={!isAscending}
      >
        <span className="text-xl font-bold" aria-hidden="true">
          {icon}
        </span>
        {text}
      </button>
    </div>
  );
}
