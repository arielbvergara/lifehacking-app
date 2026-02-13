'use client';

import { SearchBar } from './search-bar';
import { CategoryTags } from './category-tags';

export interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

const DEFAULT_TAGS = ['kitchenhacks', 'organization', 'wellness'];

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
    <section className="relative bg-gradient-to-b from-[#e8f5e8] via-[#f0f9f0] to-white py-12 md:py-16 lg:py-20 pb-24 md:pb-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 animate-pulse-slow">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span className="text-sm font-medium text-gray-700">New tips added daily!</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Make life a little{' '}
            <span className="text-primary">easier,</span> every day!
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Simple tricks for cooking, cleaning, and living better. No expert skills required.
          </p>
        </div>

        <div className="mb-6">
          <SearchBar 
            placeholder="What can we help you with today?" 
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
