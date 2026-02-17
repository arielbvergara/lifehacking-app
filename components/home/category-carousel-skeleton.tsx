/**
 * CategoryCarouselSkeleton Component
 * 
 * Loading skeleton for the category carousel.
 * Matches the responsive layout of the actual carousel:
 * - Mobile: 1 card
 * - Tablet: 2 cards
 * - Desktop: 3 cards
 */
export function CategoryCarouselSkeleton() {
  return (
    <section className="bg-gradient-to-b from-white to-grey py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse self-start sm:self-auto" />
        </div>

        <div className="relative">
          {/* Skeleton Cards */}
          <div className="overflow-hidden">
            <div className="flex">
              {/* Mobile: 1 card, Tablet: 2 cards, Desktop: 3 cards */}
              <div className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                </div>
              </div>
              
              {/* Second card - hidden on mobile */}
              <div className="hidden md:block md:w-1/2 lg:w-1/3 flex-shrink-0 px-3">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                </div>
              </div>
              
              {/* Third card - hidden on mobile and tablet */}
              <div className="hidden lg:block lg:w-1/3 flex-shrink-0 px-3">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton Navigation Arrows */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-gray-200 rounded-full animate-pulse" />

          {/* Skeleton Dots */}
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
