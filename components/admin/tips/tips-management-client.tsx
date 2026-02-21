'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchTips } from '@/lib/api/tips';
import { deleteTip } from '@/lib/api/admin-tip';
import { TipsTable } from './tips-table';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { useToast } from '@/lib/hooks/use-toast';
import type { TipSummary } from '@/lib/types/api';

const PAGE_SIZE = 10;

/**
 * TipsManagementClient Component
 * 
 * Client-side component for managing tips with search, pagination, edit, and delete functionality.
 * Fetches tips on mount and when page or search query changes.
 * Maintains search filters when refreshing after deletion.
 * Navigates to previous page if current page becomes empty after deletion.
 */
export function TipsManagementClient() {
  const router = useRouter();
  const { idToken } = useAuth();
  const { showToast } = useToast();
  
  const [tips, setTips] = useState<TipSummary[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tipToDelete, setTipToDelete] = useState<{ id: string; title: string } | null>(null);

  /**
   * Load tips from API with current filters
   * Requirement 2.1: Fetch tips on mount and when page/search changes
   * Requirement 2.4: Use fetchTips API
   */
  const loadTips = async () => {
    setLoading(true);

    try {
      const response = await fetchTips({
        q: searchQuery || undefined,
        pageNumber: currentPage,
        pageSize: PAGE_SIZE,
      });
      
      setTips(response.items || []);
      setTotalItems(response.metadata?.totalItems || 0);
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to load tips';
      showToast({
        type: 'error',
        message: errorMessage,
        duration: 7000,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch tips when page or search query changes
   * Requirement 2.1: Fetch tips on mount and when page/search changes
   */
  useEffect(() => {
    loadTips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  /**
   * Handle search query changes
   * Requirement 2.3: Implement search handler (resets to page 1)
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  };

  /**
   * Handle page changes
   * Requirement 3.3, 3.4: Implement page change handler
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Handle edit button click
   * Requirement 4.1: Implement edit handler (navigate to edit page)
   */
  const handleEdit = (tipId: string) => {
    router.push(`/admin/tips/${tipId}/edit`);
  };

  /**
   * Handle delete button click
   * Requirement 5.1: Implement delete click handler (open confirmation dialog)
   */
  const handleDeleteClick = (tipId: string, tipTitle: string) => {
    setTipToDelete({ id: tipId, title: tipTitle });
    setDeleteDialogOpen(true);
  };

  /**
   * Handle delete confirmation
   * Requirement 5.3, 5.4: Implement delete confirm handler (call API, refresh list, handle empty page)
   * Requirement 12.1: Refresh list after deletion
   * Requirement 12.4: Maintain search filters when refreshing after deletion
   * Requirement 12.5: Navigate to previous page if current page becomes empty
   */
  const handleDeleteConfirm = async () => {
    if (!tipToDelete || !idToken) return;

    try {
      await deleteTip(tipToDelete.id, idToken);
      
      showToast({
        type: 'success',
        message: 'Tip deleted successfully',
        duration: 5000,
      });
      
      setDeleteDialogOpen(false);
      setTipToDelete(null);
      
      // If current page will be empty after deletion, go to previous page
      // Requirement 12.5: Handle empty page after deletion
      if (tips.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // Reload tips with current filters
        // Requirement 12.4: Maintain search filters when refreshing
        await loadTips();
      }
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to delete tip';
      showToast({
        type: 'error',
        message: errorMessage,
        duration: 7000,
      });
    }
  };

  /**
   * Handle delete cancellation
   * Requirement 5.1: Close dialog without making changes
   */
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTipToDelete(null);
  };

  return (
    <>
      <TipsTable
        tips={tips}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        searchQuery={searchQuery}
        loading={loading}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        title="Delete Tip"
        message={`Are you sure you want to delete "${tipToDelete?.title}"? This action cannot be undone.`}
        confirmButtonLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />
    </>
  );
}
