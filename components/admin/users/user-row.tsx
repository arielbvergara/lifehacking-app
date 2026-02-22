'use client';

import { UserSummary } from '@/lib/types/admin-user';

export interface UserRowProps {
  user: UserSummary;
  onDelete: (userId: string, userEmail: string) => void;
}

/**
 * UserRow displays a user in the users management list.
 * Shows user icon, email, display name, role badge, created date, and action buttons.
 * Responsive: full row on desktop, card layout on mobile.
 * Deleted users are visually distinguished with opacity and a badge.
 */
export function UserRow({ user, onDelete }: UserRowProps) {
  // Format date to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    if (role.toLowerCase() === 'admin') {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const roleBadgeClass = getRoleBadgeColor(user.role);
  const isDeleted = user.isDeleted === true;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 md:p-6 ${
        isDeleted ? 'opacity-60' : ''
      }`}
    >
      {/* Desktop Layout: Horizontal */}
      <div className="hidden md:flex md:items-center md:gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
          👤
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {user.email}
            </h3>
            {isDeleted && (
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                Deleted
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {user.name || 'No display name'}
          </p>
          <div className="flex items-center gap-3">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${roleBadgeClass}`}>
              {user.role}
            </span>
            <span className="text-xs text-gray-500">
              Created: {formatDate(user.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <button
            onClick={() => onDelete(user.id, user.email)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label={`Delete ${user.email}`}
            disabled={isDeleted}
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
            👤
          </div>

          {/* Email and Role */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {user.email}
              </h3>
              {isDeleted && (
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  Deleted
                </span>
              )}
            </div>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${roleBadgeClass}`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Display Name */}
        <p className="text-sm text-gray-600 mb-3">
          {user.name || 'No display name'}
        </p>

        {/* Created Date and Actions */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Created: {formatDate(user.createdAt)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(user.id, user.email)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label={`Delete ${user.email}`}
              disabled={isDeleted}
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
