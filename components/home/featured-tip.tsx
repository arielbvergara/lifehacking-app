'use client';

import { useRouter } from 'next/navigation';
import { TipSummary } from '@/lib/types/api';
import { truncateText } from '@/lib/utils/text';

export interface FeaturedTipProps {
  tip: TipSummary | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const DESCRIPTION_MAX_LENGTH = 200;
const LIFEHACK_BADGE_TEXT = 'LIFEHACK';
const READ_MORE_TEXT = 'Read More';
const SAVE_TEXT = 'Save';

/**
 * FeaturedTip Component
 * 
 * Displays the most recent tip in a prominent card format with image,
 * badge, title, description, and action buttons.
 */
export function FeaturedTip({ tip, loading, error, onRetry }: FeaturedTipProps) {
  const router = useRouter();

  const handleReadMore = () => {
    if (tip) {
      router.push(`/tip/${tip.id}`);
    }
  };

  const handleSave = () => {
    // Placeholder for future implementation
    // This button is intentionally non-functional
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <FeaturedTipSkeleton />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!tip) {
    return null;
  }

  const truncatedDescription = truncateText(tip.description, DESCRIPTION_MAX_LENGTH);

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Content Section */}
            <div className="flex-1 p-8 md:p-12">
              <div className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-4">
                {LIFEHACK_BADGE_TEXT}
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {tip.title}
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {truncatedDescription}
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={handleReadMore}
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {READ_MORE_TEXT}
                </button>
                
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {SAVE_TEXT}
                </button>
              </div>
            </div>

            {/* Image Section */}
            {tip.image?.imageUrl && (
              <div className="lg:w-1/2 h-64 lg:h-auto">
                <img
                  src={tip.image.imageUrl}
                  alt={tip.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedTipSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-8 md:p-12">
          <div className="w-24 h-6 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded mb-6 w-4/6"></div>
          <div className="flex gap-4">
            <div className="w-32 h-12 bg-gray-200 rounded-xl"></div>
            <div className="w-24 h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
        <div className="lg:w-1/2 h-64 lg:h-auto bg-gray-200"></div>
      </div>
    </div>
  );
}
