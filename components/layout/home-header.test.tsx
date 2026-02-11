import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { User as FirebaseUser } from 'firebase/auth';
import { HomeHeader } from './home-header';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock auth context
const mockSignOut = vi.fn();
vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    signOut: mockSignOut,
  }),
}));

// Mock child components
vi.mock('@/components/shared/logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}));

vi.mock('@/components/layout/user-avatar', () => ({
  UserAvatar: ({ user, onClick }: { user: FirebaseUser; onClick?: () => void }) => (
    <button onClick={onClick} data-testid="user-avatar">
      {user.displayName || user.email}
    </button>
  ),
}));

describe('HomeHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Anonymous User UI', () => {
    it('should display Login button for anonymous users', () => {
      render(<HomeHeader user={null} />);

      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    });

    it('should display Join for Free button for anonymous users', () => {
      render(<HomeHeader user={null} />);

      expect(screen.getByRole('link', { name: /join for free/i })).toBeInTheDocument();
    });

    it('should not display UserAvatar for anonymous users', () => {
      render(<HomeHeader user={null} />);

      expect(screen.queryByTestId('user-avatar')).not.toBeInTheDocument();
    });

    it('should navigate to login page when Login button is clicked', () => {
      render(<HomeHeader user={null} />);

      const loginLink = screen.getByRole('link', { name: /login/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should navigate to signup page when Join for Free button is clicked', () => {
      render(<HomeHeader user={null} />);

      const signupLink = screen.getByRole('link', { name: /join for free/i });
      expect(signupLink).toHaveAttribute('href', '/signup');
    });
  });

  describe('Authenticated User UI', () => {
    const mockUser = {
      uid: '123',
      displayName: 'John Doe',
      email: 'john@example.com',
    } as FirebaseUser;

    it('should display UserAvatar for authenticated users', () => {
      render(<HomeHeader user={mockUser} />);

      expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
    });

    it('should not display Login button for authenticated users', () => {
      render(<HomeHeader user={mockUser} />);

      expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
    });

    it('should not display Join for Free button for authenticated users', () => {
      render(<HomeHeader user={mockUser} />);

      expect(screen.queryByRole('link', { name: /join for free/i })).not.toBeInTheDocument();
    });
  });

  describe('Avatar Dropdown Menu', () => {
    const mockUser = {
      uid: '123',
      displayName: 'John Doe',
      email: 'john@example.com',
    } as FirebaseUser;

    it('should open dropdown menu when avatar is clicked', async () => {
      const user = userEvent.setup();
      render(<HomeHeader user={mockUser} />);

      const avatar = screen.getByTestId('user-avatar');
      await user.click(avatar);

      expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('should close dropdown menu when avatar is clicked again', async () => {
      const user = userEvent.setup();
      render(<HomeHeader user={mockUser} />);

      const avatar = screen.getByTestId('user-avatar');
      
      // Open dropdown
      await user.click(avatar);
      expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();

      // Close dropdown
      await user.click(avatar);
      expect(screen.queryByRole('button', { name: /profile/i })).not.toBeInTheDocument();
    });

    it('should navigate to profile page when Profile is clicked', async () => {
      const user = userEvent.setup();
      render(<HomeHeader user={mockUser} />);

      const avatar = screen.getByTestId('user-avatar');
      await user.click(avatar);

      const profileButton = screen.getByRole('button', { name: /profile/i });
      await user.click(profileButton);

      expect(mockPush).toHaveBeenCalledWith('/profile');
    });

    it('should call signOut and navigate to home when Sign Out is clicked', async () => {
      const user = userEvent.setup();
      mockSignOut.mockResolvedValue(undefined);
      
      render(<HomeHeader user={mockUser} />);

      const avatar = screen.getByTestId('user-avatar');
      await user.click(avatar);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should close dropdown after navigating to profile', async () => {
      const user = userEvent.setup();
      render(<HomeHeader user={mockUser} />);

      const avatar = screen.getByTestId('user-avatar');
      await user.click(avatar);

      const profileButton = screen.getByRole('button', { name: /profile/i });
      await user.click(profileButton);

      expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
    });

    it('should handle sign out errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockSignOut.mockRejectedValue(new Error('Sign out failed'));
      
      render(<HomeHeader user={mockUser} />);

      const avatar = screen.getByTestId('user-avatar');
      await user.click(avatar);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Mobile Menu', () => {
    const mockUser = {
      uid: '123',
      displayName: 'John Doe',
      email: 'john@example.com',
    } as FirebaseUser;

    it('should toggle mobile menu when menu button is clicked', async () => {
      const user = userEvent.setup();
      render(<HomeHeader user={null} />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      
      // Open menu
      await user.click(menuButton);
      
      // Check if mobile menu items are visible
      const mobileLoginLinks = screen.getAllByRole('link', { name: /login/i });
      expect(mobileLoginLinks.length).toBeGreaterThan(0);
    });

    it('should display user info in mobile menu for authenticated users', async () => {
      const user = userEvent.setup();
      render(<HomeHeader user={mockUser} />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      // Check that user info is displayed in mobile menu (there will be multiple instances)
      const userDisplays = screen.getAllByText(mockUser.displayName!);
      expect(userDisplays.length).toBeGreaterThan(0);
    });

    it('should close mobile menu when login link is clicked', async () => {
      const user = userEvent.setup();
      render(<HomeHeader user={null} />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      // Find mobile login link (not the desktop one)
      const mobileLinks = screen.getAllByRole('link', { name: /login/i });
      const mobileLoginLink = mobileLinks.find(link => 
        link.className.includes('px-4')
      );

      if (mobileLoginLink) {
        await user.click(mobileLoginLink);
      }

      // Menu should close (button text changes back to 'menu')
      expect(menuButton.textContent).toBe('menu');
    });

    it('should display Profile and Sign Out in mobile menu for authenticated users', async () => {
      const user = userEvent.setup();
      render(<HomeHeader user={mockUser} />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      const buttons = screen.getAllByRole('button');
      const profileButton = buttons.find(btn => btn.textContent === 'Profile');
      const signOutButton = buttons.find(btn => btn.textContent === 'Sign Out');

      expect(profileButton).toBeInTheDocument();
      expect(signOutButton).toBeInTheDocument();
    });
  });

  describe('Logo Display', () => {
    it('should display logo', () => {
      render(<HomeHeader user={null} />);

      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should have sticky positioning', () => {
      const { container } = render(<HomeHeader user={null} />);
      
      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('top-0');
    });

    it('should have z-index for layering', () => {
      const { container } = render(<HomeHeader user={null} />);
      
      const header = container.querySelector('header');
      expect(header).toHaveClass('z-50');
    });
  });
});
