'use client';

import { Category } from '@/lib/types/api';
import { CategoryCard } from './category-card';

export interface ExploreCategoriesProps {
  categories: Category[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

/**
 * ExploreCategories Component
 * 
 * Displays a grid of category cards with loading and error states.
 * Includes a section title, subtitle, and "View all" link.
 */
export function ExploreCategories({
  categories,
  loading,
  error,
  onRetry,
}: ExploreCategoriesProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Explore Categories
            </h2>
            <p className="text-gray-600">
              Find simple tricks for every area of your life
            </p>
          </div>
          <a
            href="/categories"
            className="text-primary font-semibold hover:text-primary-dark transition-colors"
          >
            View all &gt;
          </a>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <CategoryCardSkeleton key={index} />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && categories && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-full mb-3"></div>
      <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
  );
}
