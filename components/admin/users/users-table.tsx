'use client';

import { UserSummary } from '@/lib/types/admin-user';
import { UserRow } from './user-row';
import { UsersSearch } from './users-search';
import { Pagination } from '@/components/admin/shared/pagination';

export interface UsersTableProps {
  users: UserSummary[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  loading: boolean;
  onSearch: (query: string) => void;
  onPageChange: (page: number) => void;
  onDelete: (userId: string, userEmail: string) => void;
}

/**
 * UsersTable Component
 * 
 * Displays a list of users with search, pagination, and action buttons.
 * Shows loading state, empty state, and error handling.
 */
export function UsersTable({
  users,
  totalItems,
  currentPage,
  pageSize,
  searchQuery,
  loading,
  onSearch,
  onPageChange,
  onDelete,
}: UsersTableProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <UsersSearch initialQuery={searchQuery} onSearch={onSearch} />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Loading users...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'No users have been created yet'}
          </p>
        </div>
      )}

      {/* Users List */}
      {!loading && users.length > 0 && (
        <>
          <div className="space-y-4">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onDelete={onDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={onPageChange}
              itemLabel="users"
            />
          )}

          {/* Results Summary */}
          <div className="text-center text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} users
          </div>
        </>
      )}
    </div>
  );
}
