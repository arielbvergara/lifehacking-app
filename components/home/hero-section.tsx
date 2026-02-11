'use client';

import { SearchBar } from './search-bar';
import { CategoryTags } from './category-tags';

export interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

const DEFAULT_TAGS = ['Popular', 'Recommended', 'Automotive', 'Fashion'];

/**
 * HeroSection Component
 * 
 * Displays the hero section of the home page with headline, subheadline,
 * search bar, and category tags.
 * 
 * @example
 * <HeroSection />
 */
export function HeroSection({ onSearch }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-b from-primary/5 to-transparent py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Make life a little easier, every day!
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Simple tricks for cooking, cleaning, and living better. No expert skills required.
          </p>
        </div>

        <div className="mb-6">
          <SearchBar 
            placeholder="Search for tips..." 
            onSearch={onSearch}
          />
        </div>

        <div className="flex justify-center">
          <CategoryTags tags={DEFAULT_TAGS} />
        </div>
      </div>
    </section>
  );
}
