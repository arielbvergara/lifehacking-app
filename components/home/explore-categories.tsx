import Link from 'next/link';
import { Category } from '@/lib/types/api';
import { CategoryCard } from '../shared/category/category-card';

export interface ExploreCategoriesProps {
  categories: Category[];
}

/**
 * ExploreCategories Component
 * 
 * Displays a grid of category cards.
 * Server-rendered with cached data for optimal performance.
 */
export function ExploreCategories({ categories }: ExploreCategoriesProps) {
  return (
    <section className="bg-gradient-to-b from-white to-grey py-12 md:py-16">
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
          <Link
            href="/categories"
            className="text-primary font-semibold hover:text-primary-dark transition-colors"
          >
            View all &gt;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <CategoryCard 
              key={category.id} 
              category={category}
              priority={index < 6}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
