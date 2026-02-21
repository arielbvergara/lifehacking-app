'use client';

export interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

/**
 * ActionButtons Component
 * 
 * Reusable edit and delete action buttons for admin tables.
 * Displays icon-only buttons with accessible labels.
 * 
 * @param onEdit - Callback when edit button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param editLabel - Custom accessible label for edit button, defaults to "Edit"
 * @param deleteLabel - Custom accessible label for delete button, defaults to "Delete"
 * 
 * @example
 * <ActionButtons
 *   onEdit={() => handleEdit(id)}
 *   onDelete={() => handleDelete(id)}
 * />
 */
export function ActionButtons({
  onEdit,
  onDelete,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Edit Button */}
      <button
        onClick={onEdit}
        type="button"
        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={editLabel}
        data-testid="edit-button"
      >
        <span className="material-icons-round text-xl" aria-hidden="true">
          edit
        </span>
      </button>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        type="button"
        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label={deleteLabel}
        data-testid="delete-button"
      >
        <span className="material-icons-round text-xl" aria-hidden="true">
          delete
        </span>
      </button>
    </div>
  );
}
