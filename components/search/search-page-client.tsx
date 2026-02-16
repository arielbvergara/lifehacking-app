'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';

/**
 * SearchPageClient Component
 * 
 * Client-side wrapper for search page header that handles URL navigation.
 * Manages category selection and search query updates via URL parameters.
 */
export function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle category selection - update URL with categoryId
  const handleCategorySelect = (newCategoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newCategoryId) {
      params.set('categoryId', newCategoryId);
    } else {
      // Remove categoryId when "All" is selected
      params.delete('categoryId');
    }
    
    router.push(`/search?${params.toString()}`);
  };

  // Handle search submission - update URL with q parameter
  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    
    router.push(`/search?${params.toString()}`);
  };

  const categoryId = searchParams.get('categoryId');

  return (
    <Header
      showSearchBar={true}
      showCategoryFilter={true}
      selectedCategoryId={categoryId}
      onCategorySelect={handleCategorySelect}
      onSearch={handleSearch}
    />
  );
}
