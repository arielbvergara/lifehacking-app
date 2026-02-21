'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchCategories } from '@/lib/api/categories';
import { deleteCategory } from '@/lib/api/admin-category';
import { CategoriesTable } from './categories-table';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { useToast } from '@/lib/hooks/use-toast';
import type { Category } from '@/lib/types/api';

/**
 * CategoriesManagementClient Component
 * 
 * Client-side component for managing categories with edit and delete functionality.
 * Fetches categories on mount and displays them in a simple list (no pagination/search).
 * Enhanced confirmation for deletion requires typing the category name.
 * Shows cascade warning that deleting a category will also delete all associated tips.
 */
export function CategoriesManagementClient() {
  const router = useRouter();
  const { idToken } = useAuth();
  const { showToast } = useToast();
  
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    iconUrl?: string;
    tipCount: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);

  /**
   * Load categories from API
   * Requirement 6.1: Fetch categories on mount
   * Requirement 6.3: Use fetchCategories API
   */
  const loadCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchCategories();
      
      // Transform categories to add tipCount: 0 as placeholder
      // The backend API should be extended to include tipCount in the future
      const categoriesWithTipCount = (response.items || []).map((cat: Category) => ({
        id: cat.id,
        name: cat.name,
        iconUrl: cat.image?.imageUrl || undefined,
        tipCount: 0, // Placeholder for MVP
      }));
      
      setCategories(categoriesWithTipCount);
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to load categories';
      setError(errorMessage);
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
   * Fetch categories when component mounts
   * Requirement 6.1: Fetch categories on mount
   */
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handle edit button click
   * Requirement 7.1: Implement edit handler (navigate to edit page)
   */
  const handleEdit = (categoryId: string) => {
    router.push(`/admin/category/${categoryId}/edit`);
  };

  /**
   * Handle delete button click
   * Requirement 8.1: Implement delete click handler (open confirmation dialog with cascade warning)
   */
  const handleDeleteClick = (categoryId: string, categoryName: string) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setDeleteDialogOpen(true);
  };

  /**
   * Handle delete confirmation
   * Requirement 8.3, 8.4, 8.5: Implement delete confirm handler (call API, refresh list)
   * Requirement 12.2: Enhanced confirmation requires typing category name
   */
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete || !idToken) return;

    try {
      await deleteCategory(categoryToDelete.id, idToken);
      
      showToast({
        type: 'success',
        message: 'Category deleted successfully',
        duration: 5000,
      });
      
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      
      // Reload categories to reflect the change
      await loadCategories();
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to delete category';
      showToast({
        type: 'error',
        message: errorMessage,
        duration: 7000,
      });
    }
  };

  /**
   * Handle delete cancellation
   * Requirement 8.1: Close dialog without making changes
   */
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <>
      <CategoriesTable
        categories={categories}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        title="Delete Category"
        message={`Warning: Deleting this category will also delete all associated tips. This action cannot be undone. Type the category name to confirm.`}
        confirmText={categoryToDelete?.name}
        confirmButtonLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />
    </>
  );
}
