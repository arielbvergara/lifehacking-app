'use client';

import { ActionButtons } from '@/components/admin/shared/action-buttons';

export interface CategoryRowProps {
  category: {
    id: string;
    name: string;
    iconUrl?: string;
    tipCount: number;
  };
  onEdit: (categoryId: string) => void;
  onDelete: (categoryId: string, categoryName: string) => void;
}

/**
 * CategoryRow displays a category in the categories management list.
 * Shows category icon, name, tip count, and action buttons.
 * Responsive: full row on desktop, card layout on mobile.
 */
export function CategoryRow({ category, onEdit, onDelete }: CategoryRowProps) {
  const tipCountText = `${category.tipCount} ${category.tipCount === 1 ? 'tip' : 'tips'}`;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 md:p-6">
      {/* Desktop Layout: Horizontal */}
      <div className="hidden md:flex md:items-center md:gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
          {category.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.iconUrl}
              alt=""
              className="w-8 h-8 object-contain"
            />
          ) : (
            '📁'
          )}
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {category.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {tipCountText}
          </p>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          <ActionButtons
            onEdit={() => onEdit(category.id)}
            onDelete={() => onDelete(category.id, category.name)}
            editLabel={`Edit ${category.name}`}
            deleteLabel={`Delete ${category.name}`}
          />
        </div>
      </div>

      {/* Mobile Layout: Vertical */}
      <div className="md:hidden">
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
            {category.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={category.iconUrl}
                alt=""
                className="w-6 h-6 object-contain"
              />
            ) : (
              '📁'
            )}
          </div>

          {/* Name */}
          <div className="flex-grow min-w-0">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
              {category.name}
            </h3>
          </div>
        </div>

        {/* Tip Count and Actions */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {tipCountText}
          </span>
          <ActionButtons
            onEdit={() => onEdit(category.id)}
            onDelete={() => onDelete(category.id, category.name)}
            editLabel={`Edit ${category.name}`}
            deleteLabel={`Delete ${category.name}`}
          />
        </div>
      </div>
    </div>
  );
}
