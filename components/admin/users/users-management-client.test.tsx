import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersManagementClient } from './users-management-client';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchUsers, deleteUser } from '@/lib/api/admin-user';
import { useToast } from '@/lib/hooks/use-toast';

// Mock dependencies
vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/api/admin-user', () => ({
  fetchUsers: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock('@/lib/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

vi.mock('./users-table', () => ({
  UsersTable: ({ users, loading, onDelete, onSearch, onPageChange }: {
    users: UserSummary[];
    loading: boolean;
    onDelete: (userId: string, userEmail: string) => void;
    onSearch: (query: string) => void;
    onPageChange: (page: number) => void;
  }) => (
    <div data-testid="users-table">
      {loading && <div>Loading...</div>}
      {!loading && users.map((user) => (
        <div key={user.id} data-testid={`user-${user.id}`}>
          {user.email}
          <button onClick={() => onDelete(user.id, user.email)}>Delete</button>
        </div>
      ))}
      <input
        data-testid="search-input"
        onChange={(e) => onSearch(e.target.value)}
      />
      <button onClick={() => onPageChange(2)}>Next Page</button>
    </div>
  ),
}));

vi.mock('@/components/shared/confirmation-dialog', () => ({
  ConfirmationDialog: ({ isOpen, onConfirm, onCancel }: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }) => (
    isOpen ? (
      <div data-testid="confirmation-dialog">
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null
  ),
}));

describe('UsersManagementClient', () => {
  const mockShowToast = vi.fn();
  const mockFetchUsers = fetchUsers as ReturnType<typeof vi.fn>;
  const mockDeleteUser = deleteUser as ReturnType<typeof vi.fn>;

  const mockUsersResponse = {
    items: [
      {
        id: '1',
        email: 'user1@example.com',
        name: 'User One',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00Z',
        isDeleted: false,
      },
      {
        id: '2',
        email: 'user2@example.com',
        name: 'User Two',
        role: 'user',
        createdAt: '2024-01-02T00:00:00Z',
        isDeleted: false,
      },
    ],
    pagination: {
      totalItems: 2,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ idToken: 'test-token' });
    (useToast as ReturnType<typeof vi.fn>).mockReturnValue({ showToast: mockShowToast });
    mockFetchUsers.mockResolvedValue(mockUsersResponse);
  });

  describe('UsersManagementClient_Should_LoadUsers_When_ComponentMounts', () => {
    it('should fetch users on mount', async () => {
      render(<UsersManagementClient />);

      await waitFor(() => {
        expect(mockFetchUsers).toHaveBeenCalledWith(
          {
            search: undefined,
            pageNumber: 1,
            pageSize: 10,
          },
          'test-token'
        );
      });
    });

    it('should display users after loading', async () => {
      render(<UsersManagementClient />);

      await waitFor(() => {
        expect(screen.getByTestId('user-1')).toBeInTheDocument();
        expect(screen.getByTestId('user-2')).toBeInTheDocument();
      });
    });

    it('should display loading state initially', () => {
      render(<UsersManagementClient />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not fetch users when idToken is not available', async () => {
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ idToken: null });

      render(<UsersManagementClient />);

      await waitFor(() => {
        expect(mockFetchUsers).not.toHaveBeenCalled();
      });
    });
  });

  describe('UsersManagementClient_Should_HandleSearch_When_SearchQueryChanges', () => {
    it('should fetch users with search query', async () => {
      const user = userEvent.setup();
      render(<UsersManagementClient />);

      await waitFor(() => {
        expect(screen.getByTestId('users-table')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(mockFetchUsers).toHaveBeenCalledWith(
          {
            search: 'test',
            pageNumber: 1,
            pageSize: 10,
          },
          'test-token'
        );
      });
    });

    it('should reset to first page when search query changes', async () => {
      const user = userEvent.setup();
      render(<UsersManagementClient />);

      await waitFor(() => {
        expect(screen.getByTestId('users-table')).toBeInTheDocument();
      });

      // Go to page 2
      const nextPageButton = screen.getByText('Next Page');
      await user.click(nextPageButton);

      await waitFor(() => {
        expect(mockFetchUsers).toHaveBeenCalledWith(
          expect.objectContaining({ pageNumber: 2 }),
          'test-token'
        );
      });

      // Search should reset to page 1
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(mockFetchUsers).toHaveBeenCalledWith(
          {
            search: 'test',
            pageNumber: 1,
            pageSize: 10,
          },
          'test-token'
        );
      });
    });
  });

  describe('UsersManagementClient_Should_HandlePagination_When_PageChanges', () => {
    it('should fetch users for new page', async () => {
      const user = userEvent.setup();
      render(<UsersManagementClient />);

      await waitFor(() => {
        expect(screen.getByTestId('users-table')).toBeInTheDocument();
      });

      const nextPageButton = screen.getByText('Next Page');
      await user.click(nextPageButton);

      await waitFor(() => {
        expect(mockFetchUsers).toHaveBeenCalledWith(
          {
            search: undefined,
            pageNumber: 2,
            pageSize: 10,
          },
          'test-token'
        );
      });
    });
  });

  describe('UsersManagementClient_Should_HandleDelete_When_DeleteButtonClicked', () => {
    it('should open confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<UsersManagementClient />);

      await waitFor(() => {
        expect(screen.getByTestId('user-1')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText('Delete')[0];
      await user.click(deleteButton);

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
    });

    it('should call deleteUser when deletion is confirmed', async () => {
      const user = userEvent.setup();
      mockDeleteUser.mockResolvedValue({});

      render(<UsersManagementClient />);

      await waitFor(() => {
        expect(screen.getByTestId('user-1')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText('Delete')[0];
      await user.click(deleteButton);

      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteUser).toHaveBeenCalledWith('1', 'test-token');
      });
    });

    it('should show success toast when user is deleted successfully', async () => {
      const user = userEvent.setup();
      mockDeleteUser.mockResolvedValue({});

      render(<UsersManagementClient />);

      await waitFor(() => {
        expect(screen.getByTestId('user-1')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText('Delete')[0];
      await user.click(deleteButton);

      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'User deleted successfully',
          duration: 5000,
        });
      });
    });

    it('should reload users after successful deletion', async () => {
      const user = userEvent.setup();
      mockDeleteUser.mockResolvedValue({});

      render(<UsersManagementClient />);

      await waitFor(() => {
        expect(screen.getByTestId('user-1')).toBeInTheDocument();
      });

      // Clear previous calls
      mockFetchUsers.mockClear();

      const deleteButton = screen.getAllByText('Delete')[0];
      await user.click(deleteButton);

      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockFetchUsers).toHaveBeenCalled();
      });
    });

    it('should navigate to previous page when last item on page is deleted', async () => {
      const user = userEvent.setup();
      mockDeleteUser.mockResolvedValue({});

      // Mock response with single user on page 2
      mockFetchUsers.mockResolvedValue({
        items: [
          {
            id: '3',
            email: 'user3@example.com',
            name: 'User Three',
            role: 'user',
            createdAt: '2024-01-03T00:00:00Z',
            isDeleted: false,
          },
        ],
        pagination: {
          totalItems: 1,
          currentPage: 2,
          pageSize: 10,
          totalPages: 2,
        },
      });

      render(<UsersManagementClient />);

      await waitFor(() => {
        expect(screen.getByTestId('users-table')).toBeInTheDocument();
      });

      // Go to page 2
      const nextPageButton = screen.getByText('Next Page');
      await user.click(nextPageButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-3')).toBeInTheDocument();
      });

      // Delete the only user on page 2
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockFetchUsers).toHaveBeenCalledWith(
          expect.objectContaining({ pageNumber: 1 }),
          'test-token'
        );
      });
    });

    it('should show error toast when deletion fails', async () => {
      const user = userEvent.setup();
      mockDeleteUser.mockRejectedValue(new Error('Deletion failed'));

      render(<UsersManagementClient />);

      await waitFor(() => {
        expect(screen.getByTestId('user-1')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText('Delete')[0];
      await user.click(deleteButton);

      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'Deletion failed',
          duration: 7000,
        });
      });
    });

    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<UsersManagementClient />);

      await waitFor(() => {
        expect(screen.getByTestId('user-1')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText('Delete')[0];
      await user.click(deleteButton);

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
    });
  });

  describe('UsersManagementClient_Should_HandleErrors_When_FetchFails', () => {
    it('should show error toast when fetch fails', async () => {
      mockFetchUsers.mockRejectedValue(new Error('Failed to load users'));

      render(<UsersManagementClient />);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'Failed to load users',
          duration: 7000,
        });
      });
    });
  });
});
