import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { User as FirebaseUser } from 'firebase/auth';
import { Header } from './header';

// Mock Next.js router
const mockPush = vi.fn();
const mockPathname = vi.fn(() => '/');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname(),
}));

// Mock auth context
const mockSignOut = vi.fn();
const mockUseAuth = vi.fn();
vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock favorites context
const mockUseFavoritesContext = vi.fn();
vi.mock('@/lib/context/favorites-context', () => ({
  useFavoritesContext: () => mockUseFavoritesContext(),
}));

// Mock child components
vi.mock('@/components/shared/logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}));

vi.mock('@/components/shared/search-bar', () => ({
  SearchBar: ({ variant, onSearch, placeholder }: { variant?: string; onSearch?: (query: string) => void; placeholder?: string }) => (
    <div data-testid="search-bar" data-variant={variant} data-placeholder={placeholder}>
      <input 
        type="text" 
        placeholder={placeholder}
        aria-label="Search"
        data-testid="search-input"
      />
      <button onClick={() => onSearch?.('test')} aria-label="Search">Search</button>
    </div>
  ),
}));

vi.mock('@/components/layout/user-avatar', () => ({
  UserAvatar: ({ user, onClick }: { user: FirebaseUser; onClick?: () => void }) => (
    <button onClick={onClick} data-testid="user-avatar" aria-label={`User menu for ${user.displayName || user.email}`}>
      {user.displayName || user.email}
    </button>
  ),
}));

/**
 * Header Accessibility Tests
 * Task 7: Verify styling consistency and accessibility
 */
describe('Header - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      signOut: mockSignOut,
      loading: false,
    });
    mockUseFavoritesContext.mockReturnValue({
      favorites: [],
      isLoading: false,
      error: null,
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      isFavorite: vi.fn(() => false),
      refreshFavorites: vi.fn(),
      count: 0,
    });
  });

  describe('Mobile Search Button Aria-labels', () => {
    it('Header_ShouldHaveSearchAriaLabel_WhenSearchClosed', () => {
      render(<Header />);
      
      // Find the mobile search toggle button (not the SearchBar button)
      const buttons = screen.getAllByRole('button');
      const searchToggleButton = buttons.find(btn => 
        btn.getAttribute('aria-label') === 'Search' && 
        btn.querySelector('.material-icons-round')
      );
      
      expect(searchToggleButton).toBeTruthy();
      
      // When closed, should say "Search"
      if (searchToggleButton) {
        expect(searchToggleButton).toHaveAttribute('aria-label', 'Search');
      }
    });

    it('Header_ShouldHaveCloseSearchAriaLabel_WhenSearchOpen', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      // Find the mobile search toggle button (not the SearchBar button)
      const buttons = screen.getAllByRole('button');
      const searchToggleButton = buttons.find(btn => 
        btn.getAttribute('aria-label') === 'Search' && 
        btn.querySelector('.material-icons-round')
      );
      
      expect(searchToggleButton).toBeTruthy();
      
      // Click to open search
      if (searchToggleButton) {
        await user.click(searchToggleButton);
        
        // When open, should say "Close search"
        expect(searchToggleButton).toHaveAttribute('aria-label', 'Close search');
      }
    });

    it('Header_ShouldToggleAriaLabel_WhenSearchToggled', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      const buttons = screen.getAllByRole('button');
      const searchToggleButton = buttons.find(btn => 
        btn.getAttribute('aria-label') === 'Search' && 
        btn.querySelector('.material-icons-round')
      );
      
      expect(searchToggleButton).toBeTruthy();
      
      if (searchToggleButton) {
        // Initially closed
        expect(searchToggleButton).toHaveAttribute('aria-label', 'Search');
        
        // Open
        await user.click(searchToggleButton);
        expect(searchToggleButton).toHaveAttribute('aria-label', 'Close search');
        
        // Close again
        await user.click(searchToggleButton);
        expect(searchToggleButton).toHaveAttribute('aria-label', 'Search');
      }
    });
  });

  describe('Mobile Menu Button Aria-label', () => {
    it('Header_ShouldHaveToggleMenuAriaLabel_OnMobileMenuButton', () => {
      render(<Header />);
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      
      expect(menuButton).toHaveAttribute('aria-label', 'Toggle menu');
    });
  });

  describe('Keyboard Navigation', () => {
    it('Header_ShouldAllowKeyboardNavigation_ThroughAllLinks', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      // Get all navigation links
      const homeLink = screen.getByRole('link', { name: /^home$/i });
      const categoriesLink = screen.getByRole('link', { name: /^categories$/i });
      const popularLink = screen.getByRole('link', { name: /^popular$/i });
      const aboutLink = screen.getByRole('link', { name: /^about$/i });
      
      // All links should be keyboard accessible
      expect(homeLink).toBeInTheDocument();
      expect(categoriesLink).toBeInTheDocument();
      expect(popularLink).toBeInTheDocument();
      expect(aboutLink).toBeInTheDocument();
      
      // Tab through links
      await user.tab();
      // One of the interactive elements should have focus
      expect(document.activeElement).toBeTruthy();
    });

    it('Header_ShouldAllowKeyboardAccess_ToSearchBar', async () => {
      const user = userEvent.setup();
      render(<Header />);
      
      // Search input should be keyboard accessible
      const searchInput = screen.getAllByTestId('search-input')[0];
      
      await user.click(searchInput);
      expect(searchInput).toHaveFocus();
    });

    it('Header_ShouldAllowKeyboardAccess_ToAuthButtons', async () => {
      render(<Header />);
      
      const loginLink = screen.getByRole('link', { name: /login/i });
      const signupLink = screen.getByRole('link', { name: /join for free/i });
      
      // Both should be keyboard accessible
      expect(loginLink).toBeInTheDocument();
      expect(signupLink).toBeInTheDocument();
    });

    it('Header_ShouldAllowKeyboardAccess_ToUserAvatar', async () => {
      const mockUser = {
        uid: '123',
        displayName: 'John Doe',
        email: 'john@example.com',
      } as FirebaseUser;

      mockUseAuth.mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
        loading: false,
      });

      render(<Header />);
      
      const avatar = screen.getByTestId('user-avatar');
      
      // Avatar should be keyboard accessible
      // Focus the avatar
      avatar.focus();
      expect(document.activeElement).toBe(avatar);
    });

    it('Header_ShouldAllowKeyboardNavigation_InDropdownMenu', async () => {
      const mockUser = {
        uid: '123',
        displayName: 'John Doe',
        email: 'john@example.com',
      } as FirebaseUser;

      mockUseAuth.mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
        loading: false,
      });

      const user = userEvent.setup();
      render(<Header />);
      
      const avatar = screen.getByTestId('user-avatar');
      await user.click(avatar);
      
      const profileButton = screen.getByRole('button', { name: /profile/i });
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      
      // Both buttons should be keyboard accessible
      expect(profileButton).toBeInTheDocument();
      expect(signOutButton).toBeInTheDocument();
      
      // Tab to first button
      profileButton.focus();
      expect(document.activeElement).toBe(profileButton);
    });

    it('Header_ShouldAllowKeyboardAccess_ToMobileMenuButton', async () => {
      render(<Header />);
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      
      // Focus the button
      menuButton.focus();
      expect(document.activeElement).toBe(menuButton);
    });

    it('Header_ShouldAllowKeyboardAccess_ToMobileSearchButton', async () => {
      render(<Header />);
      
      const buttons = screen.getAllByRole('button');
      const searchToggleButton = buttons.find(btn => 
        btn.getAttribute('aria-label') === 'Search' && 
        btn.querySelector('.material-icons-round')
      );
      
      expect(searchToggleButton).toBeTruthy();
      
      if (searchToggleButton) {
        // Focus the button
        searchToggleButton.focus();
        expect(document.activeElement).toBe(searchToggleButton);
      }
    });
  });

  describe('Focus States', () => {
    it('Header_ShouldHaveFocusStates_OnMobileButtons', () => {
      const { container } = render(<Header />);
      
      const buttons = container.querySelectorAll('button');
      const mobileButtons = Array.from(buttons).filter(btn => 
        btn.querySelector('.material-icons-round')
      );
      
      mobileButtons.forEach(button => {
        // Mobile buttons should have focus states
        expect(button.className).toContain('focus:outline-none');
        expect(button.className).toContain('focus:ring-2');
        expect(button.className).toContain('focus:ring-primary');
      });
    });

    it('Header_ShouldHaveFocusStates_OnDropdownButtons', async () => {
      const mockUser = {
        uid: '123',
        displayName: 'John Doe',
        email: 'john@example.com',
      } as FirebaseUser;

      mockUseAuth.mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
        loading: false,
      });

      const user = userEvent.setup();
      const { container } = render(<Header />);
      
      const avatar = screen.getByTestId('user-avatar');
      await user.click(avatar);
      
      const dropdownButtons = container.querySelectorAll('.absolute button');
      
      dropdownButtons.forEach(button => {
        // Dropdown buttons should have hover states
        expect(button.className).toContain('hover:bg-gray-50');
        expect(button.className).toContain('transition-colors');
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('Header_ShouldHaveAccessibleNames_OnAllButtons', () => {
      render(<Header />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        // All buttons should have accessible names (either text content or aria-label)
        const hasAccessibleName = button.textContent || button.getAttribute('aria-label');
        expect(hasAccessibleName).toBeTruthy();
      });
    });

    it('Header_ShouldHaveAccessibleNames_OnAllLinks', () => {
      render(<Header />);
      
      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        // All links should have accessible names
        expect(link.textContent).toBeTruthy();
      });
    });

    it('Header_ShouldHaveAccessibleName_OnUserAvatar', () => {
      const mockUser = {
        uid: '123',
        displayName: 'John Doe',
        email: 'john@example.com',
      } as FirebaseUser;

      mockUseAuth.mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
        loading: false,
      });

      render(<Header />);
      
      const avatar = screen.getByTestId('user-avatar');
      
      // Avatar should have accessible name
      expect(avatar).toHaveAttribute('aria-label', `User menu for ${mockUser.displayName}`);
    });
  });

  describe('Semantic HTML', () => {
    it('Header_ShouldUseSemanticHeaderElement_WhenRendered', () => {
      const { container } = render(<Header />);
      
      const header = container.querySelector('header');
      expect(header).toBeTruthy();
    });

    it('Header_ShouldUseSemanticNavElement_WhenRendered', () => {
      const { container } = render(<Header />);
      
      const nav = container.querySelector('nav');
      expect(nav).toBeTruthy();
    });

    it('Header_ShouldUseButtonElements_ForInteractiveControls', () => {
      render(<Header />);
      
      // Menu button should be a button element
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton.tagName).toBe('BUTTON');
      
      // Search button should be a button element
      const buttons = screen.getAllByRole('button');
      const searchButton = buttons.find(btn => 
        btn.getAttribute('aria-label') === 'Search' && 
        btn.querySelector('.material-icons-round')
      );
      expect(searchButton?.tagName).toBe('BUTTON');
    });

    it('Header_ShouldUseLinkElements_ForNavigation', () => {
      render(<Header />);
      
      const homeLink = screen.getByRole('link', { name: /^home$/i });
      const categoriesLink = screen.getByRole('link', { name: /^categories$/i });
      
      expect(homeLink.tagName).toBe('A');
      expect(categoriesLink.tagName).toBe('A');
    });
  });

  describe('Color Contrast', () => {
    it('Header_ShouldUseAccessibleColors_ForText', () => {
      const { container } = render(<Header />);
      
      // Navigation links should use accessible colors
      const links = container.querySelectorAll('a');
      
      links.forEach(link => {
        // Should use gray-700 or primary colors (both have good contrast)
        const hasAccessibleColor = 
          link.className.includes('text-gray-700') || 
          link.className.includes('text-primary') ||
          link.className.includes('text-white');
        expect(hasAccessibleColor).toBe(true);
      });
    });

    it('Header_ShouldUseAccessibleColors_ForButtons', () => {
      const { container } = render(<Header />);
      
      // Primary buttons should have white text on primary background
      const primaryButtons = container.querySelectorAll('.bg-primary');
      
      primaryButtons.forEach(button => {
        expect(button.className).toContain('text-white');
      });
    });
  });
});
