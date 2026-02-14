'use client';

import { TipSummary } from '@/lib/types/api';
import { TipCard } from '../shared/tip/tip-card';

export interface LatestLifehacksProps {
  tips: TipSummary[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const SECTION_TITLE = 'Latest Lifehacks';

/**
 * LatestLifehacks Component
 * 
 * Displays a grid of recent tips with loading and error states.
 */
export function LatestLifehacks({
  tips,
  loading,
  error,
  onRetry,
}: LatestLifehacksProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          {SECTION_TITLE}
        </h2>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <TipCardSkeleton key={index} />
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

        {!loading && !error && tips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        )}

        {!loading && !error && tips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No tips available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function TipCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-5">
        <div className="w-20 h-6 bg-gray-200 rounded-full mb-3"></div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded mb-1"></div>
        <div className="h-4 bg-gray-200 rounded mb-4 w-5/6"></div>
        <div className="flex items-center justify-between">
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
