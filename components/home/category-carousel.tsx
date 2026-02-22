'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Category } from '@/lib/types/api';
import { CategoryCard } from '../shared/category/category-card';

export interface CategoryCarouselProps {
  categories: Category[];
}

const AUTO_PLAY_INTERVAL = 3000; // 3 seconds for all viewports

/**
 * CategoryCarousel Component
 * 
 * Displays categories in an infinite carousel with responsive items per view.
 * Features:
 * - Infinite loop scrolling
 * - Auto-play every 3 seconds
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
  const [isTablet, setIsTablet] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Detect viewport size
  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Create infinite loop by duplicating categories
  const extendedCategories = [
    ...categories,
    ...categories,
  ];

  const totalSlides = categories.length;

  const goToNext = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  }, []);

  const goToPrevious = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => prevIndex - 1);
  }, []);

  // Handle infinite loop reset
  useEffect(() => {
    if (!isTransitioning) return;

    // After reaching the end of the first set, reset to the beginning
    if (currentIndex >= totalSlides) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 500); // Match transition duration
    }
    // After going before the start, reset to the end
    else if (currentIndex < 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalSlides - 1);
      }, 500); // Match transition duration
    }
  }, [currentIndex, totalSlides, isTransitioning]);

  // Auto-play functionality
  useEffect(() => {
    if (isHovered || isPaused) return;

    const autoPlayInterval = setInterval(() => {
      goToNext();
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(autoPlayInterval);
  }, [isHovered, isPaused, goToNext]);

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
    } else if (isTablet) {
      // Tablet: 2 cards per view, move by 50% (1 card width)
      return `translateX(-${currentIndex * 50}%)`;
    }
    // Desktop: 3 cards per view, move by 33.333% (1 card width)
    return `translateX(-${currentIndex * (100 / 3)}%)`;
  };

  return (
    <section className="bg-gradient-to-b from-white to-grey py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Explore Categories
            </h2>
            <p className="text-gray-600">
              Find simple tricks for every area of your life
            </p>
          </div>
          <Link
            href="/categories"
            className="text-primary font-semibold hover:text-primary-dark transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            View all &gt;
          </Link>
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
              className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
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
                  setIsTransitioning(true);
                  setCurrentIndex(index);
                  setIsPaused(true);
                }}
                className={`w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  index === (currentIndex % totalSlides)
                    ? 'bg-primary w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === (currentIndex % totalSlides) ? 'true' : 'false'}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
