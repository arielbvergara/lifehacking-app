import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersTable } from './users-table';
import { UserSummary } from '@/lib/types/admin-user';

// Mock child components
vi.mock('./user-row', () => ({
  UserRow: ({ user }: { user: UserSummary }) => (
    <div data-testid="user-row">{user.email}</div>
  ),
}));

vi.mock('./users-search', () => ({
  UsersSearch: ({ initialQuery, onSearch }: { initialQuery: string; onSearch: (v: string) => void }) => (
    <input
      data-testid="users-search"
      value={initialQuery}
      onChange={(e) => onSearch(e.target.value)}
    />
  ),
}));

vi.mock('../shared/pagination', () => ({
  Pagination: ({ currentPage, totalItems }: { currentPage: number; totalItems: number }) => (
    <div data-testid="pagination">
      Page {currentPage} of {totalItems}
    </div>
  ),
}));

describe('UsersTable', () => {
  const mockUsers: UserSummary[] = [
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
  ];

  const defaultProps = {
    users: mockUsers,
    totalItems: 2,
    currentPage: 1,
    pageSize: 10,
    searchQuery: '',
    loading: false,
    onSearch: vi.fn(),
    onPageChange: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UsersTable_Should_DisplayLoadingState_When_LoadingIsTrue', () => {
    it('should display loading spinner when loading is true', () => {
      render(<UsersTable {...defaultProps} loading={true} users={[]} />);

      expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });

    it('should display loading spinner with animation', () => {
      const { container } = render(<UsersTable {...defaultProps} loading={true} users={[]} />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not display users when loading', () => {
      render(<UsersTable {...defaultProps} loading={true} />);

      expect(screen.queryByTestId('user-row')).not.toBeInTheDocument();
    });

    it('should not display pagination when loading', () => {
      render(<UsersTable {...defaultProps} loading={true} />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  describe('UsersTable_Should_DisplayEmptyState_When_NoUsersExist', () => {
    it('should display "no users found" message when users array is empty', () => {
      render(<UsersTable {...defaultProps} users={[]} totalItems={0} />);

      expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    it('should display search-specific message when search query is present', () => {
      render(
        <UsersTable
          {...defaultProps}
          users={[]}
          totalItems={0}
          searchQuery="nonexistent"
        />
      );

      expect(screen.getByText('Try adjusting your search query')).toBeInTheDocument();
    });

    it('should display generic message when no search query', () => {
      render(<UsersTable {...defaultProps} users={[]} totalItems={0} />);

      expect(screen.getByText('No users have been created yet')).toBeInTheDocument();
    });

    it('should display users icon in empty state', () => {
      const { container } = render(<UsersTable {...defaultProps} users={[]} totalItems={0} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should not display pagination when users array is empty', () => {
      render(<UsersTable {...defaultProps} users={[]} totalItems={0} />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  describe('UsersTable_Should_RenderUsers_When_UsersExist', () => {
    it('should render all users in the array', () => {
      render(<UsersTable {...defaultProps} />);

      const userRows = screen.getAllByTestId('user-row');
      expect(userRows).toHaveLength(2);
    });

    it('should render UserRow components with correct user data', () => {
      render(<UsersTable {...defaultProps} />);

      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });
  });

  describe('UsersTable_Should_DisplaySearchComponent_When_Rendered', () => {
    it('should include UsersSearch component', () => {
      render(<UsersTable {...defaultProps} />);

      expect(screen.getByTestId('users-search')).toBeInTheDocument();
    });

    it('should pass searchQuery to UsersSearch', () => {
      render(<UsersTable {...defaultProps} searchQuery="test query" />);

      const searchInput = screen.getByTestId('users-search') as HTMLInputElement;
      expect(searchInput.value).toBe('test query');
    });

    it('should display search in white card with shadow', () => {
      const { container } = render(<UsersTable {...defaultProps} />);

      const searchCard = container.querySelector('.bg-white.rounded-lg.shadow-sm');
      expect(searchCard).toBeInTheDocument();
    });
  });

  describe('UsersTable_Should_DisplayPagination_When_MultiplePages', () => {
    it('should include Pagination component when users are present and multiple pages exist', () => {
      render(
        <UsersTable
          {...defaultProps}
          totalItems={25}
          pageSize={10}
        />
      );

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should pass correct props to Pagination', () => {
      render(
        <UsersTable
          {...defaultProps}
          currentPage={2}
          totalItems={50}
          pageSize={10}
        />
      );

      expect(screen.getByText(/Page 2 of 50/)).toBeInTheDocument();
    });

    it('should not display pagination when only one page exists', () => {
      render(
        <UsersTable
          {...defaultProps}
          totalItems={5}
          pageSize={10}
        />
      );

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should not display pagination when loading', () => {
      render(<UsersTable {...defaultProps} loading={true} />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should not display pagination when no users', () => {
      render(<UsersTable {...defaultProps} users={[]} totalItems={0} />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });
});
