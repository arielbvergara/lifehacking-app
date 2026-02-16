'use client';

import type { Category } from '@/lib/types/api';
import Image from 'next/image';

export interface CategoryPillProps {
  category: Category | null; // null for "All" category
  isSelected: boolean;
  onClick: () => void;
}

/**
 * CategoryPill Component
 * 
 * Renders an individual category button with optional image icon.
 * Used in the CategoryFilterBar to display filterable categories.
 * 
 * @example
 * // "All" category pill
 * <CategoryPill category={null} isSelected={true} onClick={() => {}} />
 * 
 * @example
 * // Category with image
 * <CategoryPill category={categoryWithImage} isSelected={false} onClick={() => {}} />
 */
export function CategoryPill({ category, isSelected, onClick }: CategoryPillProps) {
  const isAllCategory = category === null;
  const categoryName = isAllCategory ? 'All' : category.name;
  const hasImage = !isAllCategory && category.image?.imageUrl;

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
        ${
          isSelected
            ? 'bg-primary text-white hover:bg-primary-dark'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      {hasImage && (
        <div className="relative w-6 h-6 flex-shrink-0">
          <Image
            src={category.image!.imageUrl!}
            alt=""
            fill
            className="object-contain"
            sizes="24px"
          />
        </div>
      )}
      <span className="whitespace-nowrap">{categoryName}</span>
    </button>
  );
}
