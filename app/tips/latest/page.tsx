import { connection } from 'next/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TipCard } from '@/components/shared/tip/tip-card';
import { getCachedLatestTips } from '@/lib/data/tip-data';

/**
 * LatestTipsPage Component
 * 
 * Server component that displays the latest tips.
 * - Fetches latest tips sorted by creation date with caching (5-minute cache)
 * - Uses connection() to defer rendering to request time
 */
export default async function LatestTipsPage() {
  // Defer to request time to avoid build-time API dependency
  await connection();

  // Fetch latest tips with caching
  const response = await getCachedLatestTips(1, 20);
  const { items: tips, metadata: pagination } = response;

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Latest Tips
          </h1>
          <p className="text-gray-600">
            {pagination.totalItems} {pagination.totalItems === 1 ? 'tip' : 'tips'} found
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
            <p className="text-gray-600 text-lg">No tips found</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
