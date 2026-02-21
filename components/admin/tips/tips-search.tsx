'use client';

import { useState, useEffect, useRef } from 'react';

export interface TipsSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

/**
 * TipsSearch Component
 * 
 * Search input with debouncing for tips management.
 * Includes search icon and clear button that appears when input has value.
 * Maintains focus after clearing for better UX.
 * 
 * @param value - Current search query value
 * @param onChange - Handler called with debounced search value
 * @param placeholder - Placeholder text for the input
 * @param debounceMs - Debounce delay in milliseconds (default: 300ms)
 * 
 * @example
 * <TipsSearch
 *   value={searchQuery}
 *   onChange={handleSearch}
 *   placeholder="Search tips..."
 * />
 */
export function TipsSearch({
  value,
  onChange,
  placeholder = 'Search tips by title or description...',
  debounceMs = 300,
}: TipsSearchProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipDebounceRef = useRef(false);

  // Sync local value with prop value when it changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the onChange callback
  useEffect(() => {
    // Skip debounced callback if explicitly cleared
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [localValue, debounceMs, onChange, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    skipDebounceRef.current = true; // Skip debounced callback
    onChange('');
    // Maintain focus after clearing
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      {/* Search Icon */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-gray-400 text-xl">
        search
      </span>

      {/* Search Input */}
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        aria-label="Search tips"
      />

      {/* Clear Button - only visible when input has value */}
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Clear search"
          type="button"
        >
          <span className="material-icons-round text-gray-400 text-xl">
            close
          </span>
        </button>
      )}
    </div>
  );
}
