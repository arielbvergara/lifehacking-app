'use client';

import type { Category } from '@/lib/types/api';

export interface CategoryPillProps {
  category: Category | null; // null for "All" category
  isSelected: boolean;
  onClick: () => void;
  fullWidth?: boolean; // Whether to display full width (for vertical layout)
}

/**
 * CategoryPill Component
 * 
 * Renders an individual category button with optional image icon.
 * Used in the CategoryFilterBar to display filterable categories.
 * 
 * @param fullWidth - Whether to display full width (for vertical layout)
 * 
 * @example
 * // "All" category pill
 * <CategoryPill category={null} isSelected={true} onClick={() => {}} />
 * 
 * @example
 * // Category with image, full width
 * <CategoryPill category={categoryWithImage} isSelected={false} onClick={() => {}} fullWidth={true} />
 */
export function CategoryPill({ category, isSelected, onClick, fullWidth = false }: CategoryPillProps) {
  const isAllCategory = category === null;
  const categoryName = isAllCategory ? 'All' : category.name;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="tab"
      aria-selected={isSelected}
      aria-label={`Filter by ${categoryName}`}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full
        font-medium text-sm transition-all
        min-h-[44px] min-w-[44px]
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${fullWidth ? 'w-full justify-center' : 'flex-shrink-0'}
        ${
          isSelected
            ? 'bg-primary text-white hover:bg-primary-dark'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      <span className="whitespace-nowrap">{categoryName}</span>
    </button>
  );
}
