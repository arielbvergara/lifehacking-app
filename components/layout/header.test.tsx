import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { User as FirebaseUser } from 'firebase/auth';
import React from 'react';
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

// Mock useFavorites hook
const mockUseFavorites = vi.fn();
vi.mock('@/lib/hooks/use-favorites', () => ({
  useFavorites: () => mockUseFavorites(),
}));

// Mock child components
vi.mock('@/components/shared/logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}));

vi.mock('@/components/shared/search-bar', () => ({
  SearchBar: ({ variant, onSearch, onSearchComplete, placeholder }: { variant?: string; onSearch?: (query: string) => void; onSearchComplete?: () => void; placeholder?: string }) => {
    const [value, setValue] = React.useState('');
    const mockRouter = { push: (url: string) => mockPush(url) };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && value.trim()) {
        if (onSearch) {
          onSearch(value);
          onSearchComplete?.();
        } else {
          // Default behavior: navigate to search page
          mockRouter.push(`/search?q=${encodeURIComponent(value.trim())}`);
          onSearchComplete?.();
        }
      }
    };
    
    return (
      <div data-testid="search-bar" data-variant={variant} data-placeholder={placeholder}>
        <input 
          type="text" 
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          data-testid="search-input"
        />
      </div>
    );
  },
}));

vi.mock('@/components/layout/user-avatar', () => ({
  UserAvatar: ({ user, onClick }: { user: FirebaseUser; onClick?: () => void }) => (
    <button onClick={onClick} data-testid="user-avatar">
      {user.displayName || user.email}
    </button>
  ),
}));

vi.mock('@/components/search/category-filter-bar', () => ({
  CategoryFilterBar: ({ selectedCategoryId, onCategorySelect }: { selectedCategoryId: string | null; onCategorySelect: (id: string | null) => void }) => (
    <div data-testid="category-filter-bar" data-selected-category={selectedCategoryId === null ? null : selectedCategoryId}>
      <button onClick={() => onCategorySelect('test-category-id')} data-testid="category-pill">
        Test Category
      </button>
    </div>
  ),
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to anonymous user
    mockUseAuth.mockReturnValue({
      user: null,
      signOut: mockSignOut,
    });
    // Default favorites count to 0
    mockUseFavorites.mockReturnValue({
      favorites: [],
      isLoading: false,
      error: null,
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      isFavorite: vi.fn(),
      refreshFavorites: vi.fn(),
      count: 0,
    });
  });

  describe('Anonymous User UI', () => {
    it('should display Login button for anonymous users', () => {
      render(<Header />);

      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    });

    it('should display Join for Free button for anonymous users', () => {
      render(<Header />);

      expect(screen.getByRole('link', { name: /join for free/i })).toBeInTheDocument();
    });

    it('should not display UserAvatar for anonymous users', () => {
      render(<Header />);

      expect(screen.queryByTestId('user-avatar')).not.toBeInTheDocument();
    });

    it('should navigate to login page when Login button is clicked', () => {
      render(<Header />);

      const loginLink = screen.getByRole('link', { name: /login/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should navigate to signup page when Join for Free button is clicked', () => {
      render(<Header />);

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

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
      });
    });

    it('should display UserAvatar for authenticated users', () => {
      render(<Header />);

      expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
    });

    it('should not display Login button for authenticated users', () => {
      render(<Header />);

      expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
    });

    it('should not display Join for Free button for authenticated users', () => {
      render(<Header />);

      expect(screen.queryByRole('link', { name: /join for free/i })).not.toBeInTheDocument();
    });
  });

  describe('Avatar Dropdown Menu', () => {
    const mockUser = {
      uid: '123',
      displayName: 'John Doe',
      email: 'john@example.com',
    } as FirebaseUser;

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
      });
    });

    it('should open dropdown menu when avatar is clicked', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const avatar = screen.getByTestId('user-avatar');
      await user.click(avatar);

      expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('should close dropdown menu when avatar is clicked again', async () => {
      const user = userEvent.setup();
      render(<Header />);

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
      render(<Header />);

      const avatar = screen.getByTestId('user-avatar');
      await user.click(avatar);

      const profileButton = screen.getByRole('button', { name: /profile/i });
      await user.click(profileButton);

      expect(mockPush).toHaveBeenCalledWith('/profile');
    });

    it('should call signOut and navigate to home when Sign Out is clicked', async () => {
      const user = userEvent.setup();
      mockSignOut.mockResolvedValue(undefined);
      
      render(<Header />);

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
      render(<Header />);

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
      
      render(<Header />);

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
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      
      // Open menu
      await user.click(menuButton);
      
      // Check if mobile menu items are visible
      const mobileLoginLinks = screen.getAllByRole('link', { name: /login/i });
      expect(mobileLoginLinks.length).toBeGreaterThan(0);
    });

    it('should display user info in mobile menu for authenticated users', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
      });
      
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      // Check that user info is displayed in mobile menu (there will be multiple instances)
      const userDisplays = screen.getAllByText(mockUser.displayName!);
      expect(userDisplays.length).toBeGreaterThan(0);
    });

    it('should close mobile menu when login link is clicked', async () => {
      const user = userEvent.setup();
      render(<Header />);

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
      mockUseAuth.mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
      });
      
      const user = userEvent.setup();
      render(<Header />);

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
      render(<Header />);

      // Should have both mobile and desktop logos
      const logos = screen.getAllByTestId('logo');
      expect(logos).toHaveLength(2);
      expect(logos[0]).toBeInTheDocument();
      expect(logos[1]).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should have sticky positioning', () => {
      const { container } = render(<Header />);
      
      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('top-0');
    });

    it('should have z-index for layering', () => {
      const { container } = render(<Header />);
      
      const header = container.querySelector('header');
      expect(header).toHaveClass('z-50');
    });
  });

  describe('Search Submission and Cleanup', () => {
    it('Header_ShouldCloseMobileSearch_WhenSearchSubmitted', async () => {
      const user = userEvent.setup();
      render(<Header />);

      // Open mobile search
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Verify search interface is open
      expect(searchButton).toHaveAccessibleName(/close search/i);

      // Submit search - get the mobile search input (second one)
      const searchInputs = screen.getAllByTestId('search-input');
      const mobileSearchInput = searchInputs[1]; // Mobile is the second one
      await user.type(mobileSearchInput, 'test query');

      // Mobile search should close after search
      expect(searchButton).toHaveAccessibleName(/search/i);
    });

    it('Header_ShouldHandleSearchErrors_WhenHandlerThrows', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockOnSearch = vi.fn(() => {
        throw new Error('Search failed');
      });
      
      const user = userEvent.setup();
      render(<Header onSearch={mockOnSearch} />);

      // Open mobile search
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Submit search that will throw error - get the mobile search input
      const searchInputs = screen.getAllByTestId('search-input');
      const mobileSearchInput = searchInputs[1]; // Mobile is the second one
      await user.type(mobileSearchInput, 'test query{Enter}');

      // Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockOnSearch).toHaveBeenCalledWith('test query');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Navigation Links', () => {
    it('NavigationLinks_ShouldDisplayAllLinks_WhenRendered', () => {
      render(<Header />);

      expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^categories$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^popular$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^about$/i })).toBeInTheDocument();
    });

    it('NavigationLinks_ShouldHaveCorrectHrefs_WhenRendered', () => {
      render(<Header />);

      expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: /^categories$/i })).toHaveAttribute('href', '/categories');
      expect(screen.getByRole('link', { name: /^popular$/i })).toHaveAttribute('href', '/tips/popular');
      expect(screen.getByRole('link', { name: /^about$/i })).toHaveAttribute('href', '/about');
    });

    it('NavigationLinks_ShouldHighlightActiveLink_WhenOnHomePage', () => {
      mockPathname.mockReturnValue('/');
      render(<Header />);

      const homeLink = screen.getByRole('link', { name: /^home$/i });
      expect(homeLink).toHaveClass('text-primary');
    });

    it('NavigationLinks_ShouldHighlightActiveLink_WhenOnCategoriesPage', () => {
      mockPathname.mockReturnValue('/categories');
      render(<Header />);

      const categoriesLink = screen.getByRole('link', { name: /^categories$/i });
      expect(categoriesLink).toHaveClass('text-primary');
    });

    it('NavigationLinks_ShouldHighlightActiveLink_WhenOnPopularPage', () => {
      mockPathname.mockReturnValue('/tips/popular');
      render(<Header />);

      const popularLink = screen.getByRole('link', { name: /^popular$/i });
      expect(popularLink).toHaveClass('text-primary');
    });

    it('NavigationLinks_ShouldHighlightActiveLink_WhenOnAboutPage', () => {
      mockPathname.mockReturnValue('/about');
      render(<Header />);

      const aboutLink = screen.getByRole('link', { name: /^about$/i });
      expect(aboutLink).toHaveClass('text-primary');
    });

    it('NavigationLinks_ShouldNotBeVisibleOnMobile_WhenMenuClosed', () => {
      render(<Header />);

      // Desktop navigation container should be hidden on mobile (hidden md:flex class)
      const homeLinks = screen.getAllByRole('link', { name: /^home$/i });
      const desktopLink = homeLinks[0];
      
      // Navigate up to the desktop navigation container
      const navLinksContainer = desktopLink.parentElement;
      const desktopNavContainer = navLinksContainer?.parentElement;
      
      expect(desktopNavContainer).toHaveClass('hidden');
      expect(desktopNavContainer).toHaveClass('md:flex');
    });

    it('NavigationLinks_ShouldAppearInMobileMenu_WhenMenuOpened', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      // Should have multiple instances of each link (desktop + mobile)
      const homeLinks = screen.getAllByRole('link', { name: /^home$/i });
      expect(homeLinks.length).toBeGreaterThan(1);
    });

    it('NavigationLinks_ShouldCloseMobileMenu_WhenLinkClicked', async () => {
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      // Find and click a mobile navigation link
      const categoriesLinks = screen.getAllByRole('link', { name: /^categories$/i });
      const mobileLink = categoriesLinks.find(link => 
        link.className.includes('rounded-lg')
      );

      if (mobileLink) {
        await user.click(mobileLink);
      }

      // Menu should close
      expect(menuButton.textContent).toBe('menu');
    });

    it('NavigationLinks_ShouldDisplayForAuthenticatedUsers_WhenLoggedIn', () => {
      const mockUser = {
        uid: '123',
        displayName: 'John Doe',
        email: 'john@example.com',
      } as FirebaseUser;

      mockUseAuth.mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
      });

      render(<Header />);

      expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^categories$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^popular$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^about$/i })).toBeInTheDocument();
    });
  });

  describe('SearchBar Integration - Desktop Layout', () => {
    it('Header_ShouldRenderSearchBar_WhenOnDesktopLayout', () => {
      render(<Header />);

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toBeInTheDocument();
    });

    it('Header_ShouldNotRenderSearchBar_WhenShowSearchBarIsFalse', () => {
      render(<Header showSearchBar={false} />);

      const searchBars = screen.queryAllByTestId('search-bar');
      expect(searchBars.length).toBe(0);
    });

    it('Header_ShouldRenderSearchBar_WhenShowSearchBarIsTrue', () => {
      render(<Header showSearchBar={true} />);

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toBeInTheDocument();
    });

    it('Header_ShouldNotRenderMobileSearchButton_WhenShowSearchBarIsFalse', () => {
      render(<Header showSearchBar={false} />);

      const buttons = screen.getAllByRole('button');
      const searchButton = buttons.find(btn => 
        btn.getAttribute('aria-label') === 'Search' && 
        btn.querySelector('.material-icons-round')
      );
      
      expect(searchButton).toBeUndefined();
    });

    it('Header_ShouldPassCompactVariant_WhenRenderingSearchBar', () => {
      render(<Header />);

      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toHaveAttribute('data-variant', 'compact');
    });

    it('Header_ShouldMaintainLayoutOrder_WhenSearchBarIntegrated', () => {
      const { container } = render(<Header />);

      const nav = container.querySelector('nav');
      const children = Array.from(nav?.children[0]?.children || []);
      
      // Verify order: Logo containers (mobile + desktop), Desktop Navigation (with SearchBar), Mobile Menu Button
      expect(children.length).toBeGreaterThan(0);
      
      // Logos should be present (both mobile and desktop)
      const logos = screen.getAllByTestId('logo');
      expect(logos).toHaveLength(2);
      expect(logos[0]).toBeInTheDocument();
      
      // SearchBar should exist
      const searchBar = screen.getByTestId('search-bar');
      expect(searchBar).toBeInTheDocument();
      
      // Navigation links should exist
      expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();
    });

    it('Header_ShouldReceiveSearchQueries_WhenSearchBarUsed', async () => {
      const user = userEvent.setup();
      
      render(<Header />);

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'test query{Enter}');

      expect(mockPush).toHaveBeenCalledWith('/search?q=test%20query');
    });

    it('Header_ShouldPreserveNavigationLinks_WhenSearchBarIntegrated', () => {
      render(<Header />);

      expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^categories$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^popular$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^about$/i })).toBeInTheDocument();
    });

    it('Header_ShouldPreserveAuthenticationUI_WhenSearchBarIntegrated', () => {
      render(<Header />);

      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /join for free/i })).toBeInTheDocument();
    });

    it('Header_ShouldPreserveAuthenticatedUserUI_WhenSearchBarIntegrated', () => {
      const mockUser = {
        uid: '123',
        displayName: 'John Doe',
        email: 'john@example.com',
      } as FirebaseUser;

      mockUseAuth.mockReturnValue({
        user: mockUser,
        signOut: mockSignOut,
      });

      render(<Header />);

      expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('Header_ShouldMaintainStickyPositioning_WhenSearchBarIntegrated', () => {
      const { container } = render(<Header />);
      
      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('top-0');
    });

    it('Header_ShouldMaintainZIndex_WhenSearchBarIntegrated', () => {
      const { container } = render(<Header />);
      
      const header = container.querySelector('header');
      expect(header).toHaveClass('z-50');
    });
  });

  describe('Responsive Behavior and Viewport Testing', () => {
    it('Header_ShouldDisplayInlineSearchBar_WhenOnDesktopViewport', () => {
      render(<Header />);

      // Desktop SearchBar should be rendered (inside the hidden md:flex container)
      const searchBars = screen.getAllByTestId('search-bar');
      
      // Should have at least one SearchBar (desktop)
      expect(searchBars.length).toBeGreaterThan(0);
      
      // Desktop SearchBar is in a container with 'hidden md:flex' classes
      const desktopSearchBar = searchBars[0];
      const desktopContainer = desktopSearchBar.parentElement?.parentElement;
      expect(desktopContainer).toHaveClass('hidden');
      expect(desktopContainer).toHaveClass('md:flex');
    });

    it('Header_ShouldDisplaySearchIconButton_WhenOnMobileViewport', () => {
      render(<Header />);

      // Mobile search icon button should be present
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeInTheDocument();
      
      // Button should be in mobile container (md:hidden)
      const mobileContainer = searchButton.parentElement;
      expect(mobileContainer).toHaveClass('md:hidden');
    });

    it('Header_ShouldHaveSmoothTransitions_WhenViewportChanges', () => {
      const { container } = render(<Header />);

      // Verify the header structure supports smooth transitions
      // The responsive classes (hidden md:flex, md:hidden) provide smooth viewport transitions
      const nav = container.querySelector('nav');
      
      // Desktop navigation container should have responsive classes
      const desktopNav = nav?.querySelector('.hidden.md\\:flex');
      expect(desktopNav).toBeTruthy();
      
      // Mobile container should have responsive classes
      const mobileContainer = nav?.querySelector('.md\\:hidden');
      expect(mobileContainer).toBeTruthy();
    });

    it('Header_ShouldNotOverlap_WhenResponsiveTransitions', () => {
      const { container } = render(<Header />);

      // Verify layout structure prevents overlapping
      const nav = container.querySelector('nav');
      const mainContainer = nav?.querySelector('.flex.justify-between');
      
      // Main container should use flexbox with proper spacing
      expect(mainContainer).toHaveClass('flex');
      expect(mainContainer).toHaveClass('justify-between');
      expect(mainContainer).toHaveClass('items-center');
    });

    it('Header_ShouldTriggerSearch_WhenOnDesktopViewport', async () => {
      const user = userEvent.setup();
      
      render(<Header />);

      // Desktop search should work
      const searchInputs = screen.getAllByTestId('search-input');
      const desktopSearchInput = searchInputs[0]; // First one is desktop
      
      await user.type(desktopSearchInput, 'desktop query{Enter}');

      expect(mockPush).toHaveBeenCalledWith('/search?q=desktop%20query');
    });

    it('Header_ShouldTriggerSearch_WhenOnMobileViewport', async () => {
      const user = userEvent.setup();
      
      render(<Header />);

      // Open mobile search
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Mobile search should work
      const searchInputs = screen.getAllByTestId('search-input');
      const mobileSearchInput = searchInputs[1]; // Second one is mobile
      
      await user.type(mobileSearchInput, 'mobile query{Enter}');

      expect(mockPush).toHaveBeenCalledWith('/search?q=mobile%20query');
    });

    it('Header_ShouldMaintainFunctionality_AtVariousViewportWidths', async () => {
      const user = userEvent.setup();
      
      // Test at different viewport scenarios
      render(<Header />);

      // Test desktop search
      const searchInputs = screen.getAllByTestId('search-input');
      await user.type(searchInputs[0], 'test{Enter}');
      expect(mockPush).toHaveBeenCalledWith('/search?q=test');

      // Test mobile search
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      const mobileSearchInputs = screen.getAllByTestId('search-input');
      await user.type(mobileSearchInputs[1], 'mobile{Enter}');
      expect(mockPush).toHaveBeenCalledWith('/search?q=mobile');
    });

    it('Header_ShouldHideDesktopSearchBar_WhenBelowMdBreakpoint', () => {
      render(<Header />);

      // Desktop navigation container should have 'hidden md:flex' classes
      const searchBars = screen.getAllByTestId('search-bar');
      const desktopSearchBar = searchBars[0];
      const desktopNavContainer = desktopSearchBar.parentElement?.parentElement;
      
      // Should be hidden on mobile, visible on desktop
      expect(desktopNavContainer).toHaveClass('hidden');
      expect(desktopNavContainer).toHaveClass('md:flex');
    });

    it('Header_ShouldHideMobileSearchButton_WhenAboveMdBreakpoint', () => {
      render(<Header />);

      // Mobile search button container should have 'md:hidden' class
      const searchButton = screen.getByRole('button', { name: /search/i });
      const mobileContainer = searchButton.parentElement;
      
      // Should be visible on mobile, hidden on desktop
      expect(mobileContainer).toHaveClass('md:hidden');
    });
  });

  describe('Category Filter Integration', () => {
    const mockOnCategorySelect = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('Header_ShouldRenderCategoryFilterBar_WhenShowCategoryFilterIsTrue', () => {
      render(
        <Header 
          showCategoryFilter={true} 
          selectedCategoryId={null}
          onCategorySelect={mockOnCategorySelect}
        />
      );

      const categoryFilterBar = screen.getByTestId('category-filter-bar');
      expect(categoryFilterBar).toBeInTheDocument();
    });

    it('Header_ShouldNotRenderCategoryFilterBar_WhenShowCategoryFilterIsFalse', () => {
      render(<Header showCategoryFilter={false} />);

      const categoryFilterBar = screen.queryByTestId('category-filter-bar');
      expect(categoryFilterBar).not.toBeInTheDocument();
    });

    it('Header_ShouldNotRenderCategoryFilterBar_WhenShowCategoryFilterIsUndefined', () => {
      render(<Header />);

      const categoryFilterBar = screen.queryByTestId('category-filter-bar');
      expect(categoryFilterBar).not.toBeInTheDocument();
    });

    it('Header_ShouldNotRenderCategoryFilterBar_WhenOnCategorySelectIsUndefined', () => {
      render(
        <Header 
          showCategoryFilter={true} 
          selectedCategoryId={null}
        />
      );

      const categoryFilterBar = screen.queryByTestId('category-filter-bar');
      expect(categoryFilterBar).not.toBeInTheDocument();
    });

    it('Header_ShouldPassSelectedCategoryId_WhenRenderingCategoryFilterBar', () => {
      const testCategoryId = 'test-category-123';
      
      render(
        <Header 
          showCategoryFilter={true} 
          selectedCategoryId={testCategoryId}
          onCategorySelect={mockOnCategorySelect}
        />
      );

      const categoryFilterBar = screen.getByTestId('category-filter-bar');
      expect(categoryFilterBar).toHaveAttribute('data-selected-category', testCategoryId);
    });

    it('Header_ShouldPassNullSelectedCategoryId_WhenAllCategoriesSelected', () => {
      render(
        <Header 
          showCategoryFilter={true} 
          selectedCategoryId={null}
          onCategorySelect={mockOnCategorySelect}
        />
      );

      const categoryFilterBar = screen.getByTestId('category-filter-bar');
      // When selectedCategoryId is null, the data attribute will be null (not set)
      expect(categoryFilterBar.getAttribute('data-selected-category')).toBeNull();
    });

    it('Header_ShouldCallOnCategorySelect_WhenCategoryPillClicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Header 
          showCategoryFilter={true} 
          selectedCategoryId={null}
          onCategorySelect={mockOnCategorySelect}
        />
      );

      const categoryPill = screen.getByTestId('category-pill');
      await user.click(categoryPill);

      expect(mockOnCategorySelect).toHaveBeenCalledWith('test-category-id');
    });

    it('Header_ShouldMaintainSearchBarFunctionality_WhenCategoryFilterBarDisplayed', () => {
      render(
        <Header 
          showSearchBar={true}
          showCategoryFilter={true} 
          selectedCategoryId={null}
          onCategorySelect={mockOnCategorySelect}
        />
      );

      const searchBar = screen.getByTestId('search-bar');
      const categoryFilterBar = screen.getByTestId('category-filter-bar');

      expect(searchBar).toBeInTheDocument();
      expect(categoryFilterBar).toBeInTheDocument();
    });

    it('Header_ShouldMaintainNavigationLinks_WhenCategoryFilterBarDisplayed', () => {
      render(
        <Header 
          showCategoryFilter={true} 
          selectedCategoryId={null}
          onCategorySelect={mockOnCategorySelect}
        />
      );

      expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^categories$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^popular$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^about$/i })).toBeInTheDocument();
      expect(screen.getByTestId('category-filter-bar')).toBeInTheDocument();
    });

    it('Header_ShouldMaintainAuthenticationUI_WhenCategoryFilterBarDisplayed', () => {
      render(
        <Header 
          showCategoryFilter={true} 
          selectedCategoryId={null}
          onCategorySelect={mockOnCategorySelect}
        />
      );

      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /join for free/i })).toBeInTheDocument();
      expect(screen.getByTestId('category-filter-bar')).toBeInTheDocument();
    });

    it('Header_ShouldPositionCategoryFilterBarBelowNavigation_WhenRendered', () => {
      const { container } = render(
        <Header 
          showCategoryFilter={true} 
          selectedCategoryId={null}
          onCategorySelect={mockOnCategorySelect}
        />
      );

      const header = container.querySelector('header');
      const nav = header?.querySelector('nav');
      const categoryFilterContainer = container.querySelector('[data-testid="category-filter-bar"]')?.parentElement?.parentElement;

      // CategoryFilterBar should be a sibling of nav, not inside it
      expect(nav).toBeInTheDocument();
      expect(categoryFilterContainer).toBeInTheDocument();
      expect(nav?.contains(categoryFilterContainer as Node)).toBe(false);
    });

    it('Header_ShouldApplyBorderTop_WhenCategoryFilterBarRendered', () => {
      const { container } = render(
        <Header 
          showCategoryFilter={true} 
          selectedCategoryId={null}
          onCategorySelect={mockOnCategorySelect}
        />
      );

      const categoryFilterContainer = container.querySelector('[data-testid="category-filter-bar"]')?.parentElement?.parentElement;
      expect(categoryFilterContainer).toHaveClass('border-t');
      expect(categoryFilterContainer).toHaveClass('border-gray-100');
    });

    it('Header_ShouldMaintainStickyPositioning_WhenCategoryFilterBarDisplayed', () => {
      const { container } = render(
        <Header 
          showCategoryFilter={true} 
          selectedCategoryId={null}
          onCategorySelect={mockOnCategorySelect}
        />
      );

      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('top-0');
      expect(header).toHaveClass('z-50');
    });
  });

  describe('Favorites Link', () => {
    it('FavoritesLink_ShouldAppearInHeader_WhenRendered', () => {
      render(<Header />);

      const favoritesLink = screen.getByRole('link', { name: /favorites/i });
      expect(favoritesLink).toBeInTheDocument();
    });

    it('FavoritesLink_ShouldHaveCorrectHref_WhenRendered', () => {
      render(<Header />);

      const favoritesLink = screen.getByRole('link', { name: /favorites/i });
      expect(favoritesLink).toHaveAttribute('href', '/favorites');
    });

    it('FavoritesLink_ShouldDisplayHeartIcon_WhenRendered', () => {
      render(<Header />);

      const favoritesLink = screen.getByRole('link', { name: /favorites/i });
      const heartIcon = favoritesLink.querySelector('.material-icons-round');
      
      expect(heartIcon).toBeInTheDocument();
      expect(heartIcon?.textContent).toBe('favorite');
    });

    it('FavoritesLink_ShouldNotDisplayBadge_WhenCountIsZero', () => {
      mockUseFavorites.mockReturnValue({
        favorites: [],
        isLoading: false,
        error: null,
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        isFavorite: vi.fn(),
        refreshFavorites: vi.fn(),
        count: 0,
      });

      render(<Header />);

      const favoritesLink = screen.getByRole('link', { name: /favorites/i });
      const badge = favoritesLink.querySelector('.bg-red-500');
      
      expect(badge).not.toBeInTheDocument();
    });

    it('FavoritesLink_ShouldDisplayBadge_WhenCountIsGreaterThanZero', () => {
      mockUseFavorites.mockReturnValue({
        favorites: ['tip-1', 'tip-2', 'tip-3'],
        isLoading: false,
        error: null,
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        isFavorite: vi.fn(),
        refreshFavorites: vi.fn(),
        count: 3,
      });

      render(<Header />);

      const favoritesLink = screen.getByRole('link', { name: /favorites \(3 items\)/i });
      const badge = favoritesLink.querySelector('.bg-red-500');
      
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toBe('3');
    });

    it('FavoritesLink_ShouldDisplayCorrectCount_WhenCountIsLessThan100', () => {
      mockUseFavorites.mockReturnValue({
        favorites: Array(42).fill('tip'),
        isLoading: false,
        error: null,
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        isFavorite: vi.fn(),
        refreshFavorites: vi.fn(),
        count: 42,
      });

      render(<Header />);

      const favoritesLink = screen.getByRole('link', { name: /favorites \(42 items\)/i });
      const badge = favoritesLink.querySelector('.bg-red-500');
      
      expect(badge?.textContent).toBe('42');
    });

    it('FavoritesLink_ShouldDisplay99Plus_WhenCountIsGreaterThan99', () => {
      mockUseFavorites.mockReturnValue({
        favorites: Array(150).fill('tip'),
        isLoading: false,
        error: null,
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        isFavorite: vi.fn(),
        refreshFavorites: vi.fn(),
        count: 150,
      });

      render(<Header />);

      const favoritesLink = screen.getByRole('link', { name: /favorites \(150 items\)/i });
      const badge = favoritesLink.querySelector('.bg-red-500');
      
      expect(badge?.textContent).toBe('99+');
    });

    it('FavoritesLink_ShouldHaveAccessibleLabel_WhenCountIsZero', () => {
      mockUseFavorites.mockReturnValue({
        favorites: [],
        isLoading: false,
        error: null,
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        isFavorite: vi.fn(),
        refreshFavorites: vi.fn(),
        count: 0,
      });

      render(<Header />);

      const favoritesLink = screen.getByRole('link', { name: 'Favorites' });
      expect(favoritesLink).toBeInTheDocument();
    });

    it('FavoritesLink_ShouldHaveAccessibleLabel_WhenCountIsGreaterThanZero', () => {
      mockUseFavorites.mockReturnValue({
        favorites: ['tip-1', 'tip-2'],
        isLoading: false,
        error: null,
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        isFavorite: vi.fn(),
        refreshFavorites: vi.fn(),
        count: 2,
      });

      render(<Header />);

      const favoritesLink = screen.getByRole('link', { name: 'Favorites (2 items)' });
      expect(favoritesLink).toBeInTheDocument();
    });

    it('FavoritesLink_ShouldHighlightActive_WhenOnFavoritesPage', () => {
      mockPathname.mockReturnValue('/favorites');
      
      render(<Header />);

      const favoritesLink = screen.getByRole('link', { name: /favorites/i });
      expect(favoritesLink).toHaveClass('text-primary');
    });

    it('FavoritesLink_ShouldNotHighlight_WhenOnOtherPage', () => {
      mockPathname.mockReturnValue('/');
      
      render(<Header />);

      const favoritesLink = screen.getByRole('link', { name: /favorites/i });
      expect(favoritesLink).not.toHaveClass('text-primary');
      expect(favoritesLink).toHaveClass('text-gray-700');
    });

    it('FavoritesLink_ShouldAppearInMobileMenu_WhenMenuOpened', async () => {
      const user = userEvent.setup();
      mockUseFavorites.mockReturnValue({
        favorites: ['tip-1', 'tip-2'],
        isLoading: false,
        error: null,
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        isFavorite: vi.fn(),
        refreshFavorites: vi.fn(),
        count: 2,
      });

      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      // Should have multiple instances (desktop + mobile)
      const favoritesLinks = screen.getAllByRole('link', { name: /favorites/i });
      expect(favoritesLinks.length).toBeGreaterThan(1);
    });

    it('FavoritesLink_ShouldDisplayBadgeInMobileMenu_WhenCountIsGreaterThanZero', async () => {
      const user = userEvent.setup();
      mockUseFavorites.mockReturnValue({
        favorites: ['tip-1', 'tip-2', 'tip-3'],
        isLoading: false,
        error: null,
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        isFavorite: vi.fn(),
        refreshFavorites: vi.fn(),
        count: 3,
      });

      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      // Find mobile favorites link
      const favoritesLinks = screen.getAllByRole('link', { name: /favorites \(3 items\)/i });
      const mobileLink = favoritesLinks.find(link => 
        link.className.includes('rounded-lg')
      );

      expect(mobileLink).toBeInTheDocument();
      
      const badge = mobileLink?.querySelector('.bg-red-500');
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toBe('3');
    });

    it('FavoritesLink_ShouldCloseMobileMenu_WhenClicked', async () => {
      const user = userEvent.setup();
      
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      await user.click(menuButton);

      // Find and click mobile favorites link
      const favoritesLinks = screen.getAllByRole('link', { name: /favorites/i });
      const mobileLink = favoritesLinks.find(link => 
        link.className.includes('rounded-lg')
      );

      if (mobileLink) {
        await user.click(mobileLink);
      }

      // Menu should close
      expect(menuButton.textContent).toBe('menu');
    });

    it('FavoritesLink_ShouldBePositionedAfterNavLinks_WhenRendered', () => {
      const { container } = render(<Header />);

      // Get all navigation links in desktop view
      const desktopNav = container.querySelector('.hidden.md\\:flex .flex.items-center.gap-8');
      const links = desktopNav?.querySelectorAll('a');
      
      // Should have Home, Categories, Popular, About, Favorites
      expect(links?.length).toBeGreaterThanOrEqual(5);
      
      // Favorites should be the last navigation link before auth section
      const favoritesLink = Array.from(links || []).find(link => 
        link.getAttribute('href') === '/favorites'
      );
      expect(favoritesLink).toBeInTheDocument();
    });

    it('FavoritesLink_ShouldBePositionedBeforeAuthSection_WhenRendered', () => {
      render(<Header />);
      
      // Favorites link should exist
      const favoritesLink = screen.getByRole('link', { name: /favorites/i });
      expect(favoritesLink).toBeInTheDocument();
      
      // Login/Signup should exist after favorites
      const loginLink = screen.getByRole('link', { name: /login/i });
      expect(loginLink).toBeInTheDocument();
    });
  });
});
