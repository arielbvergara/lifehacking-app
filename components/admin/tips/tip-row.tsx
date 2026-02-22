'use client';

import { TipSummary } from '@/lib/types/api';
import { truncateText } from '@/lib/utils/text';

export interface TipRowProps {
  tip: TipSummary;
  onEdit: (tipId: string) => void;
  onDelete: (tipId: string, tipTitle: string) => void;
}

/**
 * TipRow displays a tip in the tips management list.
 * Shows tip icon, title, description, category badge, and action buttons.
 * Responsive: full row on desktop, card layout on mobile.
 */
export function TipRow({ tip, onEdit, onDelete }: TipRowProps) {
  // Truncate description to approximately 100 characters
  const truncatedDescription = truncateText(tip.description, 100);

  // Generate a simple hash-based color for category badge
  const getCategoryColor = (categoryName: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const categoryColorClass = getCategoryColor(tip.categoryName);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 md:p-6">
      {/* Desktop Layout: Horizontal */}
      <div className="hidden md:flex md:items-center md:gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
          💡
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {tip.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {truncatedDescription}
          </p>
          <div className="flex items-center gap-3">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${categoryColorClass}`}>
              {tip.categoryName}
            </span>
            <span className="text-xs text-gray-500">
              N/A steps
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <button
            onClick={() => onEdit(tip.id)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label={`Edit ${tip.title}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(tip.id, tip.title)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label={`Delete ${tip.title}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Layout: Vertical */}
      <div className="md:hidden">
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
            💡
          </div>

          {/* Title and Category */}
          <div className="flex-grow min-w-0">
            <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
              {tip.title}
            </h3>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${categoryColorClass}`}>
              {tip.categoryName}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {truncatedDescription}
        </p>

        {/* Steps and Actions */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            N/A steps
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(tip.id)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label={`Edit ${tip.title}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => onDelete(tip.id, tip.title)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label={`Delete ${tip.title}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
