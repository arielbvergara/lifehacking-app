'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  disabled?: boolean;
  variant?: 'default' | 'compact';
}

/**
 * SearchBar Component
 * 
 * Renders a search input with a button. Currently a non-functional placeholder
 * for future search implementation.
 * 
 * @example
 * <SearchBar placeholder="Search for tips..." />
 */
export function SearchBar({ 
  placeholder = 'Search for tips...', 
  onSearch,
  disabled = false,
  variant = 'default'
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isCompact = variant === 'compact';

  const handleSearch = () => {
    if (onSearch) {
      // Use custom handler if provided (for SearchPage)
      onSearch(searchQuery);
      setSearchQuery('');
      // Maintain focus after clearing for consecutive searches
      inputRef.current?.focus();
    } else {
      // Default behavior: navigate to search page
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex w-full gap-0 md:gap-2">
      {/* Mobile: Unified pill-shaped container */}
      <div className="flex-1 relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-12 pr-16 py-4 bg-white rounded-full shadow-lg outline-none transition-all text-gray-900 placeholder-gray-400 focus:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed md:pr-4 md:rounded-xl md:focus:border-primary md:focus:ring-2 md:focus:ring-primary md:focus:shadow-none ${
            isCompact 
              ? 'md:py-2 md:shadow-sm md:border md:border-gray-200' 
              : 'md:py-3 md:border md:border-gray-200 md:shadow-none'
          }`}
          aria-label="Search"
        />
        {/* Mobile: Circular arrow button inside input */}
        <button
          onClick={handleSearch}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:hidden"
          type="button"
          aria-label="Search"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>
      {/* Desktop: Separate Search button (hidden for compact variant) */}
      {!isCompact && (
        <button
          onClick={handleSearch}
          disabled={disabled}
          className="hidden md:block px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          type="button"
        >
          Search
        </button>
      )}
    </div>
  );
}
