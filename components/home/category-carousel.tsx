'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Category } from '@/lib/types/api';
import { CategoryCard } from '../shared/category/category-card';

export interface CategoryCarouselProps {
  categories: Category[];
}

const DESKTOP_AUTO_PLAY_INTERVAL = 5000; // 5 seconds for desktop
const MOBILE_AUTO_PLAY_INTERVAL = 2000; // 2 seconds for mobile

/**
 * CategoryCarousel Component
 * 
 * Displays categories in an infinite carousel with responsive items per view.
 * Features:
 * - Infinite loop scrolling
 * - Auto-play with responsive timing (2s mobile, 5s desktop)
 * - Pause on hover
 * - Navigation arrows
 * - Responsive design (1 item on mobile, 2 on tablet, 3 on desktop)
 * - Keyboard navigation support
 */
export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Create infinite loop by duplicating categories
  const extendedCategories = [
    ...categories,
    ...categories,
    ...categories,
  ];

  const totalSlides = categories.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      // Reset to start when reaching the end of first set
      if (nextIndex >= totalSlides) {
        return 0;
      }
      return nextIndex;
    });
  }, [totalSlides]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - 1;
      // Go to end when going before start
      if (nextIndex < 0) {
        return totalSlides - 1;
      }
      return nextIndex;
    });
  }, [totalSlides]);

  // Auto-play functionality with responsive timing
  useEffect(() => {
    if (isHovered || isPaused) return;

    const interval = isMobile ? MOBILE_AUTO_PLAY_INTERVAL : DESKTOP_AUTO_PLAY_INTERVAL;
    const autoPlayInterval = setInterval(() => {
      goToNext();
    }, interval);

    return () => clearInterval(autoPlayInterval);
  }, [isHovered, isPaused, isMobile, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
        setIsPaused(true);
      } else if (e.key === 'ArrowRight') {
        goToNext();
        setIsPaused(true);
      }
    };

    if (carouselRef.current) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrevious]);

  // Calculate transform based on viewport
  const getTransform = () => {
    if (isMobile) {
      // Mobile: 1 card per view, move by 100%
      return `translateX(-${currentIndex * 100}%)`;
    }
    // Desktop/Tablet: 3 cards per view, move by 33.333%
    return `translateX(-${currentIndex * (100 / 3)}%)`;
  };

  return (
    <section className="bg-gradient-to-b from-white to-grey py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Explore Categories
            </h2>
            <p className="text-gray-600">
              Find simple tricks for every area of your life
            </p>
          </div>
          <a
            href="/categories"
            className="text-primary font-semibold hover:text-primary-dark transition-colors"
          >
            View all &gt;
          </a>
        </div>

        <div
          ref={carouselRef}
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role="region"
          aria-label="Category carousel"
        >
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: getTransform(),
              }}
            >
              {extendedCategories.map((category, index) => (
                <div
                  key={`${category.id}-${index}`}
                  className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3"
                >
                  <CategoryCard
                    category={category}
                    priority={index < 3}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => {
              goToPrevious();
              setIsPaused(true);
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-10"
            aria-label="Previous categories"
            type="button"
          >
            <span className="material-icons-round text-gray-700">
              chevron_left
            </span>
          </button>

          <button
            onClick={() => {
              goToNext();
              setIsPaused(true);
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-10"
            aria-label="Next categories"
            type="button"
          >
            <span className="material-icons-round text-gray-700">
              chevron_right
            </span>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPaused(true);
                }}
                className={`w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  index === currentIndex
                    ? 'bg-primary w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : 'false'}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
