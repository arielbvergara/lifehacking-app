'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchUsers, deleteUser } from '@/lib/api/admin-user';
import { UsersTable } from './users-table';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { useToast } from '@/lib/hooks/use-toast';
import type { UserSummary } from '@/lib/types/admin-user';

const PAGE_SIZE = 10;

/**
 * UsersManagementClient Component
 * 
 * Client-side component for managing users with search, pagination, and delete functionality.
 * Fetches users on mount and when page or search query changes.
 * Maintains search filters when refreshing after deletion.
 * Navigates to previous page if current page becomes empty after deletion.
 */
export function UsersManagementClient() {
  const { idToken } = useAuth();
  const { showToast } = useToast();
  
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; email: string } | null>(null);

  /**
   * Fetch users when page or search query changes
   */
  useEffect(() => {
    if (!idToken) {
      setLoading(false);
      return;
    }

    const loadUsers = async () => {
      setLoading(true);

      try {
        console.log('[UsersManagementClient] Fetching users with params:', {
          search: searchQuery || undefined,
          pageNumber: currentPage,
          pageSize: PAGE_SIZE,
        });
        
        const response = await fetchUsers({
          search: searchQuery || undefined,
          pageNumber: currentPage,
          pageSize: PAGE_SIZE,
        }, idToken);
        
        console.log('[UsersManagementClient] Received response:', response);
        
        setUsers(response.items || []);
        setTotalItems(response.pagination?.totalItems || 0);
      } catch (err) {
        const errorMessage = (err as Error).message || 'Failed to load users';
        showToast({
          type: 'error',
          message: errorMessage,
          duration: 7000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, idToken]);

  /**
   * Handle search query changes
   */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  }, []);

  /**
   * Handle page changes
   */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * Handle delete button click
   */
  const handleDeleteClick = useCallback((userId: string, userEmail: string) => {
    setUserToDelete({ id: userId, email: userEmail });
    setDeleteDialogOpen(true);
  }, []);

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    if (!userToDelete || !idToken) return;

    try {
      await deleteUser(userToDelete.id, idToken);
      
      showToast({
        type: 'success',
        message: 'User deleted successfully',
        duration: 5000,
      });
      
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      
      // If current page will be empty after deletion, go to previous page
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      // Note: useEffect will automatically reload users when currentPage or other deps change
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to delete user';
      showToast({
        type: 'error',
        message: errorMessage,
        duration: 7000,
      });
    }
  };

  /**
   * Handle delete cancellation
   */
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  return (
    <>
      <UsersTable
        users={users}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        searchQuery={searchQuery}
        loading={loading}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onDelete={handleDeleteClick}
      />

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete "${userToDelete?.email}"? This action cannot be undone.`}
        confirmButtonLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />
    </>
  );
}
