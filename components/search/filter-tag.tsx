'use client';

export interface FilterTagProps {
  label: string;
  onRemove: () => void;
  type: 'category' | 'search';
}

/**
 * FilterTag Component
 * 
 * Displays an active filter as a chip with a remove button.
 * Used in FilterSidebar to show applied filters (category and search query).
 * 
 * @param label - The text to display in the tag
 * @param onRemove - Handler called when the X button is clicked
 * @param type - Type of filter for styling and accessibility
 * 
 * @example
 * <FilterTag
 *   label="Technology"
 *   onRemove={() => handleRemoveCategory()}
 *   type="category"
 * />
 */
export function FilterTag({ label, onRemove, type }: FilterTagProps) {
  const ariaLabel = type === 'category' 
    ? `Remove category filter: ${label}` 
    : `Remove search filter: ${label}`;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
      <span className="truncate max-w-[180px]">{label}</span>
      <button
        onClick={onRemove}
        aria-label={ariaLabel}
        type="button"
        className="flex-shrink-0 hover:bg-primary/20 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
      >
        <span className="material-icons-round text-base">close</span>
      </button>
    </div>
  );
}
