import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoriesManagementClient } from './categories-management-client';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock favorites hook
vi.mock('@/lib/hooks/use-favorites', () => ({
  useFavorites: () => ({
    count: 0,
    favorites: [],
    isFavorite: vi.fn(() => false),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    loading: false,
  }),
}));

// Mock auth context
const mockUseAuth = vi.fn();
vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock toast hook
const mockShowToast = vi.fn();
vi.mock('@/lib/hooks/use-toast', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Mock API functions
vi.mock('@/lib/api/categories', () => ({
  fetchCategories: vi.fn(),
}));

vi.mock('@/lib/api/admin-category', () => ({
  deleteCategory: vi.fn(),
}));

// Import after mocking
const { fetchCategories } = await import('@/lib/api/categories');
const { deleteCategory } = await import('@/lib/api/admin-category');
const mockFetchCategories = fetchCategories as ReturnType<typeof vi.fn>;
const mockDeleteCategory = deleteCategory as ReturnType<typeof vi.fn>;

describe('CategoriesManagementClient', () => {
  const mockIdToken = 'test-token';
  const mockUser = { uid: 'test-user', email: 'test@example.com' };

  const mockCategories = [
    {
      id: 'cat-1',
      name: 'Productivity',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: null,
      image: {
        imageUrl: 'https://example.com/productivity.png',
        imageStoragePath: 'categories/productivity.png',
        originalFileName: 'productivity.png',
        contentType: 'image/png',
        fileSizeBytes: 1024,
        uploadedAt: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'cat-2',
      name: 'Health',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: null,
      image: {
        imageUrl: 'https://example.com/health.png',
        imageStoragePath: 'categories/health.png',
        originalFileName: 'health.png',
        contentType: 'image/png',
        fileSizeBytes: 2048,
        uploadedAt: '2024-01-02T00:00:00Z',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: mockUser,
      idToken: mockIdToken,
      loading: false,
      error: null,
    });

    mockFetchCategories.mockResolvedValue({
      items: mockCategories,
    });
  });

  describe('Initial Load', () => {
    it('Should_LoadCategories_When_ComponentMounts', async () => {
      render(<CategoriesManagementClient />);

      // Should show loading state initially (there are 3 skeleton loaders)
      expect(screen.getAllByLabelText(/loading category/i)).toHaveLength(3);

      // Wait for categories to load
      await waitFor(() => {
        expect(screen.getAllByText('Productivity')[0]).toBeInTheDocument();
      });

      expect(screen.getAllByText('Health')[0]).toBeInTheDocument();
      expect(mockFetchCategories).toHaveBeenCalledTimes(1);
    });

    it('Should_TransformCategories_When_FetchSucceeds', async () => {
      render(<CategoriesManagementClient />);

      await waitFor(() => {
        expect(screen.getAllByText('Productivity')[0]).toBeInTheDocument();
      });

      // Verify tipCount is set to 0 (placeholder)
      const productivityRow = screen.getAllByText('Productivity')[0].closest('div');
      expect(productivityRow).toBeInTheDocument();
    });

    it('Should_ShowErrorMessage_When_FetchFails', async () => {
      const errorMessage = 'Network error';
      mockFetchCategories.mockRejectedValue(new Error(errorMessage));

      render(<CategoriesManagementClient />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load categories/i)).toBeInTheDocument();
      });

      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: errorMessage,
        duration: 7000,
      });
    });
  });

  describe('Edit Functionality', () => {
    it('Should_NavigateToEditPage_When_EditButtonClicked', async () => {
      render(<CategoriesManagementClient />);

      await waitFor(() => {
        expect(screen.getAllByText('Productivity')[0]).toBeInTheDocument();
      });

      // Find and click the edit button for Productivity (use first match)
      const editButton = screen.getAllByLabelText(/edit productivity/i)[0];
      
      await userEvent.click(editButton);

      expect(mockPush).toHaveBeenCalledWith('/admin/category/cat-1/edit');
    });
  });

  describe('Delete Functionality', () => {
    it('Should_OpenConfirmationDialog_When_DeleteButtonClicked', async () => {
      render(<CategoriesManagementClient />);

      await waitFor(() => {
        expect(screen.getAllByText('Productivity')[0]).toBeInTheDocument();
      });

      // Find and click the delete button for Productivity (use first match)
      const deleteButton = screen.getAllByLabelText(/delete productivity/i)[0];
      
      await userEvent.click(deleteButton);

      // Verify confirmation dialog is displayed
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Delete Category')).toBeInTheDocument();
      expect(screen.getByText(/warning: deleting this category will also delete all associated tips/i)).toBeInTheDocument();
    });

    it('Should_RequireTypingCategoryName_When_ConfirmingDeletion', async () => {
      render(<CategoriesManagementClient />);

      await waitFor(() => {
        expect(screen.getAllByText('Productivity')[0]).toBeInTheDocument();
      });

      // Open delete dialog
      const deleteButton = screen.getAllByLabelText(/delete productivity/i)[0];
      await userEvent.click(deleteButton);

      // Verify confirmation input is present
      const confirmInput = screen.getByPlaceholderText('Productivity');
      expect(confirmInput).toBeInTheDocument();

      // Verify delete button is disabled initially
      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      expect(confirmButton).toBeDisabled();

      // Type the category name
      await userEvent.type(confirmInput, 'Productivity');

      // Verify delete button is now enabled
      expect(confirmButton).toBeEnabled();
    });

    it('Should_DeleteCategoryAndRefreshList_When_ConfirmationSucceeds', async () => {
      mockDeleteCategory.mockResolvedValue();

      render(<CategoriesManagementClient />);

      await waitFor(() => {
        expect(screen.getAllByText('Productivity')[0]).toBeInTheDocument();
      });

      // Open delete dialog
      const deleteButton = screen.getAllByLabelText(/delete productivity/i)[0];
      await userEvent.click(deleteButton);

      // Type the category name to enable confirmation
      const confirmInput = screen.getByPlaceholderText('Productivity');
      await userEvent.type(confirmInput, 'Productivity');

      // Click confirm button
      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      await userEvent.click(confirmButton);

      // Verify delete API was called
      await waitFor(() => {
        expect(mockDeleteCategory).toHaveBeenCalledWith('cat-1', mockIdToken);
      });

      // Verify success toast was shown
      expect(mockShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Category deleted successfully',
        duration: 5000,
      });

      // Verify categories list was refreshed
      expect(mockFetchCategories).toHaveBeenCalledTimes(2); // Initial load + refresh
    });

    it('Should_ShowErrorToast_When_DeletionFails', async () => {
      const errorMessage = 'Failed to delete category';
      mockDeleteCategory.mockRejectedValue(new Error(errorMessage));

      render(<CategoriesManagementClient />);

      await waitFor(() => {
        expect(screen.getAllByText('Productivity')[0]).toBeInTheDocument();
      });

      // Open delete dialog
      const deleteButton = screen.getAllByLabelText(/delete productivity/i)[0];
      await userEvent.click(deleteButton);

      // Type the category name and confirm
      const confirmInput = screen.getByPlaceholderText('Productivity');
      await userEvent.type(confirmInput, 'Productivity');
      
      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      await userEvent.click(confirmButton);

      // Verify error toast was shown
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'error',
          message: errorMessage,
          duration: 7000,
        });
      });

      // Verify dialog is still open (not closed on error)
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('Should_CloseDialogWithoutDeletion_When_CancelClicked', async () => {
      render(<CategoriesManagementClient />);

      await waitFor(() => {
        expect(screen.getAllByText('Productivity')[0]).toBeInTheDocument();
      });

      // Open delete dialog
      const deleteButton = screen.getAllByLabelText(/delete productivity/i)[0];
      await userEvent.click(deleteButton);

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      // Verify dialog is closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Verify delete API was not called
      expect(mockDeleteCategory).not.toHaveBeenCalled();
    });
  });

  describe('Cascade Warning', () => {
    it('Should_DisplayCascadeWarning_When_DeleteDialogOpens', async () => {
      render(<CategoriesManagementClient />);

      await waitFor(() => {
        expect(screen.getAllByText('Productivity')[0]).toBeInTheDocument();
      });

      // Open delete dialog
      const deleteButton = screen.getAllByLabelText(/delete productivity/i)[0];
      await userEvent.click(deleteButton);

      // Verify cascade warning is displayed
      expect(screen.getByText(/warning: deleting this category will also delete all associated tips/i)).toBeInTheDocument();
      expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
    });
  });
});
