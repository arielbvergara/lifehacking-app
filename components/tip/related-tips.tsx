import { getCachedRelatedTips } from '@/lib/data/tip-data';
import { TipCard } from '@/components/shared/tip/tip-card';

/**
 * RelatedTipsProps Interface
 * 
 * Props for the RelatedTips component.
 */
interface RelatedTipsProps {
  categoryId: string;
  currentTipId: string;
}

/**
 * RelatedTips Component
 * 
 * Async Server Component that fetches and displays related tips from the same category.
 * Uses Next.js 16 Cache Components with 5-minute cache.
 * Filters out the current tip and shows up to 4 related tips in a responsive grid.
 * 
 * Features:
 * - Server-side data fetching with caching
 * - Fetches 5 tips to ensure 4 remain after filtering
 * - Filters out the current tip being viewed
 * - Responsive grid layout (1 column mobile, 2 tablet, 4 desktop)
 * - Reuses existing TipCard component
 * - Graceful error handling (hides section on API failure)
 * - Conditional rendering (hides if no related tips)
 * 
 * @example
 * <RelatedTips
 *   categoryId="123e4567-e89b-12d3-a456-426614174000"
 *   currentTipId="987fcdeb-51a2-43f7-8d9e-1234567890ab"
 *   categoryName="Kitchen"
 * />
 */

export async function RelatedTips({
  categoryId,
  currentTipId,
}: RelatedTipsProps) {
  // Fetch related tips with caching (5-minute cache)
  const relatedTips = await getCachedRelatedTips(categoryId, currentTipId);

  // Hide section if no related tips
  if (!relatedTips || relatedTips.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 mb-12" aria-label="Related tips from the same category">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
        More like this
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedTips.map((tip) => (
          <TipCard key={tip.id} tip={tip} />
        ))}
      </div>
    </section>
  );
}
