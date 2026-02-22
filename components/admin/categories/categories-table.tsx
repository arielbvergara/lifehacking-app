'use client';

import { CategoryRow } from './category-row';

export interface CategoriesTableProps {
  categories: Array<{
    id: string;
    name: string;
    iconUrl?: string;
    tipCount: number;
  }>;
  loading: boolean;
  error: string | null;
  onEdit: (categoryId: string) => void;
  onDelete: (categoryId: string, categoryName: string) => void;
}

/**
 * CategoriesTable Component
 * 
 * Displays a simple list of categories sorted alphabetically.
 * No pagination or search functionality - shows all categories.
 * Responsive: full table on desktop, card layout on mobile.
 * 
 * @param categories - Array of categories to display
 * @param loading - Whether categories are being loaded
 * @param error - Error message if loading failed
 * @param onEdit - Handler for edit button clicks
 * @param onDelete - Handler for delete button clicks
 */
export function CategoriesTable({
  categories,
  loading,
  error,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  // Sort categories alphabetically by name
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Table Header - Desktop Only */}
      <div className="hidden md:block">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12"></div> {/* Icon column */}
            <div className="flex-grow">
              <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                Category
              </span>
            </div>
            <div className="w-32">
              <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                Tips
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
                aria-label="Loading category"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <span className="material-icons-round text-red-600 text-3xl">
                error_outline
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load categories
            </h3>
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sortedCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <span className="material-icons-round text-gray-400 text-3xl">
                folder_off
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600">
              No categories available. Create your first category to get started.
            </p>
          </div>
        )}

        {/* Categories List */}
        {!loading && !error && sortedCategories.length > 0 && (
          <div className="space-y-4">
            {sortedCategories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
