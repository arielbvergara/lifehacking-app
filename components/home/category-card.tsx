'use client';

import { useRouter } from 'next/navigation';
import { Category } from '@/lib/types/api';
import { getCategoryIcon, formatTipCount } from '@/lib/utils/category';

export interface CategoryCardProps {
  category: Category;
  tipCount?: number;
}

/**
 * CategoryCard displays a category with its icon, name, and tip count.
 * Clicking the card navigates to the category detail page.
 */
export function CategoryCard({ category, tipCount = 0 }: CategoryCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/category/${category.id}`);
  };

  const icon = getCategoryIcon(category.name);
  const formattedCount = formatTipCount(tipCount);

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {category.name}
      </h3>
      <p className="text-sm text-gray-600">{formattedCount}</p>
    </div>
  );
}
