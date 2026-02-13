'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Category } from '@/lib/types/api';
import { getCategoryIcon, formatTipCount } from '@/lib/utils/category';

export interface CategoryCardProps {
  category: Category;
  tipCount?: number;
  priority?: boolean;
}

/**
 * CategoryCard displays a category with its image or icon, name, and tip count.
 * Clicking the card navigates to the category detail page.
 */
export function CategoryCard({ category, tipCount = 0, priority = false }: CategoryCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/category/${category.id}`);
  };

  const icon = getCategoryIcon(category.name);
  const formattedCount = formatTipCount(tipCount);
  const imageUrl = category.image?.imageUrl;

  if (imageUrl) {
    return (
      <div
        onClick={handleClick}
        className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full min-h-[200px]"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <Image
          src={imageUrl}
          alt={category.name}
          fill
          className="object-cover"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative p-6 h-full flex flex-col justify-end">
          <h3 className="text-lg font-semibold text-white mb-1">
            {category.name}
          </h3>
          <p className="text-sm text-white text-opacity-90">{formattedCount}</p>
        </div>
      </div>
    );
  }

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
