'use client';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

/**
 * Pagination Component
 * 
 * Reusable pagination controls for admin tables.
 * Displays current page information and navigation buttons.
 * 
 * @param currentPage - Current page number (1-indexed)
 * @param totalItems - Total number of items across all pages
 * @param pageSize - Number of items per page
 * @param onPageChange - Callback when page changes (receives 1-indexed page number)
 * @param itemLabel - Label for items (e.g., "tips", "categories"), defaults to "items"
 * 
 * @example
 * <Pagination
 *   currentPage={2}
 *   totalItems={100}
 *   pageSize={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   itemLabel="tips"
 * />
 */
export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = 'items',
}: PaginationProps) {
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Calculate range of items shown on current page
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  // Determine if buttons should be disabled
  const isPreviousDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;
  
  const handlePrevious = () => {
    if (!isPreviousDisabled) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (!isNextDisabled) {
      onPageChange(currentPage + 1);
    }
  };
  
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        {/* Mobile view - simplified buttons */}
        <button
          onClick={handlePrevious}
          disabled={isPreviousDisabled}
          type="button"
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Previous page"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          type="button"
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> {itemLabel}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={isPreviousDisabled}
            type="button"
            className="relative inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Previous page"
          >
            <span className="material-icons-round text-lg" aria-hidden="true">
              chevron_left
            </span>
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            type="button"
            className="relative inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Next page"
          >
            Next
            <span className="material-icons-round text-lg" aria-hidden="true">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
