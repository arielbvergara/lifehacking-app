'use client';

import { useState } from 'react';

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  disabled?: boolean;
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
  disabled = false 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex w-full gap-2">
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
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none transition-all text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Search"
        />
      </div>
      <button
        onClick={handleSearch}
        disabled={disabled}
        className="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        type="button"
      >
        Search
      </button>
    </div>
  );
}
