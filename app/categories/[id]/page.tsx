import { Metadata } from 'next';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TipCard } from '@/components/shared/tip/tip-card';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { getCachedCategoryById, getCachedTipsByCategory } from '@/lib/data/category-data';
import { generateBreadcrumbStructuredData, safeJsonLdStringify } from '@/lib/seo/structured-data';
import { SITE_URL } from '@/lib/config/site';

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    
    // Skip metadata generation during build if params are not available
    if (!id) {
      return {
        title: 'Category - LifeHackBuddy',
        description: 'Browse category tips and life hacks',
      };
    }
    
    const category = await getCachedCategoryById(id);
    
    return {
      title: `${category.name} - LifeHackBuddy`,
      description: `Browse ${category.name} tips and life hacks`,
      alternates: {
        canonical: `${SITE_URL}/categories/${id}`,
      },
    };
  } catch {
    return {
      title: 'Category Not Found - LifeHackBuddy',
      description: 'The category you are looking for could not be found.',
    };
  }
}

/**
 * CategoryPage Component
 * 
 * Server component that displays tips for a specific category.
 * - Reads category ID from URL parameters
 * - Fetches category and tips with caching (5-minute cache)
 * - Uses connection() to defer rendering to request time
 */
export default async function CategoryPage({ params }: CategoryPageProps) {
  // Defer to request time to avoid build-time API dependency
  await connection();

  // Read URL parameters
  const { id } = await params;

  // Fetch category and tips with caching
  let category;
  try {
    category = await getCachedCategoryById(id);
  } catch {
    notFound();
  }

  const response = await getCachedTipsByCategory(id, 1, 20);
  const { items: tips, metadata: pagination } = response;

  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: category.name },
  ];

  const breadcrumbStructuredData = generateBreadcrumbStructuredData(breadcrumbItems);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(breadcrumbStructuredData) }}
      />

      <div className="min-h-screen flex flex-col bg-background-light">
        <Header />
        
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <div className="mt-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category.name}
          </h1>
          <p className="text-gray-500 text-sm">
            {pagination.totalItems} {pagination.totalItems === 1 ? 'tip' : 'tips'}
          </p>
        </div>

        {/* Tips Grid */}
        {tips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No tips found in this category</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
    </>
  );
}
