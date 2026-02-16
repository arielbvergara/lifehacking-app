'use client';

import { useEffect, useState, useRef } from 'react';
import type { Category } from '@/lib/types/api';
import { fetchCategories } from '@/lib/api/categories';
import { getCachedCategories, setCachedCategories } from '@/lib/utils/category-cache';
import { CategoryPill } from './category-pill';

export interface CategoryFilterBarProps {
  selectedCategoryId: string | null; // null means "All" is selected
  onCategorySelect: (categoryId: string | null) => void;
}

/**
 * CategoryFilterBar Component
 * 
 * Displays a horizontal scrollable list of category pills with the currently selected category highlighted.
 * Fetches categories from the API on mount and caches them in session storage.
 * Hides itself entirely if the category API request fails.
 * 
 * @example
 * <CategoryFilterBar
 *   selectedCategoryId={categoryId}
 *   onCategorySelect={(id) => handleCategoryChange(id)}
 * />
 */
export function CategoryFilterBar({ selectedCategoryId, onCategorySelect }: CategoryFilterBarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCategories = async () => {
      // Check cache first
      const cached = getCachedCategories();
      if (cached) {
        setCategories(cached);
        setLoading(false);
        return;
      }

      // Fetch from API if not cached
      try {
        const response = await fetchCategories();
        setCategories(response.items);
        setCachedCategories(response.items);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load categories in CategoryFilterBar:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
        setError(err instanceof Error ? err.message : 'Failed to load categories');
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Announce category selection to screen readers
  useEffect(() => {
    // Defer announcement to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      if (selectedCategoryId === null) {
        setAnnouncement('All categories selected');
      } else {
        const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
        if (selectedCategory) {
          setAnnouncement(`${selectedCategory.name} category selected`);
        }
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [selectedCategoryId, categories]);

  // Handle arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
      return;
    }

    e.preventDefault();

    const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
    if (!buttons || buttons.length === 0) return;

    const currentIndex = Array.from(buttons).findIndex(btn => btn === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex: number;
    if (e.key === 'ArrowRight') {
      nextIndex = currentIndex + 1 >= buttons.length ? 0 : currentIndex + 1;
    } else {
      nextIndex = currentIndex - 1 < 0 ? buttons.length - 1 : currentIndex - 1;
    }

    buttons[nextIndex]?.focus();
  };

  // Hide component entirely on API error
  if (error) {
    return null;
  }

  // Display loading skeleton while fetching
  if (loading) {
    return (
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-11 w-24 bg-gray-200 rounded-full animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ARIA live region for selection announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Horizontal scrollable container */}
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Filter tips by category"
        onKeyDown={handleKeyDown}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* "All" pill first */}
        <CategoryPill
          category={null}
          isSelected={selectedCategoryId === null}
          onClick={() => onCategorySelect(null)}
        />
        
        {/* Fetched categories */}
        {categories.map((category) => (
          <CategoryPill
            key={category.id}
            category={category}
            isSelected={selectedCategoryId === category.id}
            onClick={() => onCategorySelect(category.id)}
          />
        ))}
      </div>

      {/* Scroll indicators (fade edges) for overflow */}
      <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  );
}
