import { TipSummary } from '@/lib/types/api';
import { TipCard } from '../shared/tip/tip-card';

export interface LatestLifehacksProps {
  tips: TipSummary[];
}

const SECTION_TITLE = 'Latest Lifehacks';

/**
 * LatestLifehacks Component
 * 
 * Displays a grid of recent tips.
 * Server-rendered with cached data for optimal performance.
 */
export function LatestLifehacks({ tips }: LatestLifehacksProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          {SECTION_TITLE}
        </h2>

        {tips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No tips available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
