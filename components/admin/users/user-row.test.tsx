import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRow } from './user-row';
import { UserSummary } from '@/lib/types/admin-user';

describe('UserRow', () => {
  const mockUser: UserSummary = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    isDeleted: false,
  };

  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UserRow_Should_DisplayUserInformation_When_Rendered', () => {
    it('should display user email', () => {
      render(<UserRow user={mockUser} onDelete={mockOnDelete} />);

      expect(screen.getAllByText('test@example.com')).toHaveLength(2); // Desktop and mobile
    });

    it('should display user display name', () => {
      render(<UserRow user={mockUser} onDelete={mockOnDelete} />);

      expect(screen.getAllByText('Test User')).toHaveLength(2); // Desktop and mobile
    });

    it('should display "No display name" when name is not provided', () => {
      const userWithoutName = { ...mockUser, name: undefined };
      render(<UserRow user={userWithoutName} onDelete={mockOnDelete} />);

      expect(screen.getAllByText('No display name')).toHaveLength(2); // Desktop and mobile
    });

    it('should display user role badge', () => {
      render(<UserRow user={mockUser} onDelete={mockOnDelete} />);

      expect(screen.getAllByText('admin')).toHaveLength(2); // Desktop and mobile
    });

    it('should display formatted created date', () => {
      render(<UserRow user={mockUser} onDelete={mockOnDelete} />);

      expect(screen.getAllByText(/Created: Jan 1, 2024/)).toHaveLength(2); // Desktop and mobile
    });

    it('should display user icon', () => {
      render(<UserRow user={mockUser} onDelete={mockOnDelete} />);

      expect(screen.getAllByText('👤')).toHaveLength(2); // Desktop and mobile
    });
  });

  describe('UserRow_Should_HandleDeleteAction_When_DeleteButtonClicked', () => {
    it('should call onDelete with user id and email when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<UserRow user={mockUser} onDelete={mockOnDelete} />);

      const deleteButtons = screen.getAllByLabelText('Delete test@example.com');
      await user.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith('user-123', 'test@example.com');
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('UserRow_Should_DisplayRoleBadgeColor_When_RoleIsProvided', () => {
    it('should apply purple badge color for admin role', () => {
      const { container } = render(<UserRow user={mockUser} onDelete={mockOnDelete} />);

      const badges = container.querySelectorAll('.bg-purple-100.text-purple-800');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should apply gray badge color for non-admin role', () => {
      const regularUser = { ...mockUser, role: 'user' };
      const { container } = render(<UserRow user={regularUser} onDelete={mockOnDelete} />);

      const badges = container.querySelectorAll('.bg-gray-100.text-gray-800');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('UserRow_Should_DisplayDeletedState_When_UserIsDeleted', () => {
    it('should display "Deleted" badge when user is deleted', () => {
      const deletedUser = { ...mockUser, isDeleted: true };
      render(<UserRow user={deletedUser} onDelete={mockOnDelete} />);

      expect(screen.getAllByText('Deleted')).toHaveLength(2); // Desktop and mobile
    });

    it('should apply opacity when user is deleted', () => {
      const deletedUser = { ...mockUser, isDeleted: true };
      const { container } = render(<UserRow user={deletedUser} onDelete={mockOnDelete} />);

      const wrapper = container.querySelector('.opacity-60');
      expect(wrapper).toBeInTheDocument();
    });

    it('should disable delete button when user is deleted', () => {
      const deletedUser = { ...mockUser, isDeleted: true };
      render(<UserRow user={deletedUser} onDelete={mockOnDelete} />);

      const deleteButtons = screen.getAllByLabelText('Delete test@example.com');
      deleteButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('UserRow_Should_DisplayResponsiveLayout_When_ScreenSizeChanges', () => {
    it('should render both desktop and mobile layouts', () => {
      const { container } = render(<UserRow user={mockUser} onDelete={mockOnDelete} />);

      // Desktop layout (hidden on mobile)
      const desktopLayout = container.querySelector('.hidden.md\\:flex');
      expect(desktopLayout).toBeInTheDocument();

      // Mobile layout (hidden on desktop)
      const mobileLayout = container.querySelector('.md\\:hidden');
      expect(mobileLayout).toBeInTheDocument();
    });
  });

  describe('UserRow_Should_HandleMissingCreatedDate_When_DateIsNotProvided', () => {
    it('should display "N/A" when createdAt is not provided', () => {
      const userWithoutDate = { ...mockUser, createdAt: undefined };
      render(<UserRow user={userWithoutDate} onDelete={mockOnDelete} />);

      expect(screen.getAllByText(/Created: N\/A/)).toHaveLength(2); // Desktop and mobile
    });
  });
});
