'use client';

import { TipSummary } from '@/lib/types/api';
import { TipRow } from './tip-row';
import { TipsSearch } from './tips-search';
import { Pagination } from '../shared/pagination';

export interface TipsTableProps {
  tips: TipSummary[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  loading: boolean;
  onSearch: (query: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (tipId: string) => void;
  onDelete: (tipId: string, tipTitle: string) => void;
}

/**
 * TipsTable Component
 * 
 * Displays a paginated list of tips with search functionality.
 * Includes table header, tip rows, search input, and pagination controls.
 * Responsive: full table on desktop, card layout on mobile.
 * 
 * @param tips - Array of tips to display
 * @param totalItems - Total number of tips across all pages
 * @param currentPage - Current page number (1-indexed)
 * @param pageSize - Number of tips per page
 * @param searchQuery - Current search query
 * @param loading - Whether tips are being loaded
 * @param onSearch - Handler for search query changes
 * @param onPageChange - Handler for page changes
 * @param onEdit - Handler for edit button clicks
 * @param onDelete - Handler for delete button clicks
 */
export function TipsTable({
  tips,
  totalItems,
  currentPage,
  pageSize,
  searchQuery,
  loading,
  onSearch,
  onPageChange,
  onEdit,
  onDelete,
}: TipsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Search Section */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <TipsSearch
          value={searchQuery}
          onChange={onSearch}
          placeholder="Search tips by title or description..."
        />
      </div>

      {/* Table Header - Desktop Only */}
      <div className="hidden md:block">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12"></div> {/* Icon column */}
            <div className="flex-grow">
              <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                Tip Details
              </span>
            </div>
            <div className="w-32 text-right">
              <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 md:p-6">
        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg h-24 animate-pulse"
                aria-label="Loading tip"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && tips.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <span className="material-icons-round text-gray-400 text-3xl">
                search_off
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tips found
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? `No tips match your search for "${searchQuery}"`
                : 'No tips available. Create your first tip to get started.'}
            </p>
          </div>
        )}

        {/* Tips List */}
        {!loading && tips.length > 0 && (
          <div className="space-y-4">
            {tips.map((tip) => (
              <TipRow
                key={tip.id}
                tip={tip}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && tips.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          itemLabel="tips"
        />
      )}
    </div>
  );
}
