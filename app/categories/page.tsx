import { Metadata } from 'next';
import { connection } from 'next/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { CategoryCard } from '@/components/shared/category/category-card';
import { getCachedCategories } from '@/lib/data/category-data';
import { SITE_URL } from '@/lib/config/site';

export const metadata: Metadata = {
  title: 'Browse Categories - LifeHackBuddy',
  description: 'Explore all life hack categories including kitchen, cleaning, tech, productivity, and more. Find tips organized by topic.',
  keywords: ['categories', 'life hacks', 'tips', 'browse', 'topics'],
  alternates: {
    canonical: `${SITE_URL}/categories`,
  },
};

/**
 * CategoriesPage Component
 * 
 * Server component that displays all available categories.
 * - Fetches categories with caching (5-minute cache)
 * - Uses connection() to defer rendering to request time
 */
export default async function CategoriesPage() {
  // Defer to request time to avoid build-time API dependency
  await connection();

  // Fetch categories with caching
  const categories = await getCachedCategories();

  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Title */}
        <div className="mb-8 mt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Categories
          </h1>
          <p className="text-gray-600">
            Explore tips organized by category
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No categories found</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
