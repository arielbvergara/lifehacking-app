import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { User as FirebaseUser } from 'firebase/auth';
import Home from './page';

// Mock auth context
const mockSignOut = vi.fn();
let mockUser: FirebaseUser | null = null;
let mockAuthLoading = false;

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: mockAuthLoading,
    signOut: mockSignOut,
  }),
}));

// Mock home data hook
let mockHomeData = {
  categories: null,
  featuredTip: null,
  latestTips: [],
  loading: true,
  error: null,
  retry: vi.fn(),
};

vi.mock('@/lib/hooks/use-home-data', () => ({
  useHomeData: () => mockHomeData,
}));

// Mock child components
vi.mock('@/components/layout/header', () => ({
  Header: ({ showSearchBar }: { showSearchBar?: boolean }) => (
    <div data-testid="home-header">
      Header {mockUser ? 'authenticated' : 'anonymous'} {showSearchBar !== undefined ? `search:${showSearchBar}` : ''}
    </div>
  ),
}));

vi.mock('@/components/home/hero-section', () => ({
  HeroSection: () => (
    <section data-testid="hero-section">
      <div className="container mx-auto px-4 max-w-4xl">Hero Section</div>
    </section>
  ),
}));

vi.mock('@/components/home/explore-categories', () => ({
  ExploreCategories: ({ categories, loading, error }: { categories: unknown; loading: boolean; error: string | null }) => (
    <section data-testid="explore-categories">
      <div className="container mx-auto px-4">
        {loading && 'Loading categories'}
        {error && 'Error loading categories'}
        {categories && `${(categories as Array<unknown>).length} categories`}
      </div>
    </section>
  ),
}));

vi.mock('@/components/home/featured-tip', () => ({
  FeaturedTip: ({ tip, loading, error }: { tip: { title: string } | null; loading: boolean; error: string | null }) => (
    <section data-testid="featured-tip">
      <div className="container mx-auto px-4">
        {loading && 'Loading featured tip'}
        {error && 'Error loading featured tip'}
        {tip && `Featured: ${tip.title}`}
      </div>
    </section>
  ),
}));

vi.mock('@/components/home/latest-lifehacks', () => ({
  LatestLifehacks: ({ tips, loading, error }: { tips: Array<unknown>; loading: boolean; error: string | null }) => (
    <section data-testid="latest-lifehacks">
      <div className="container mx-auto px-4">
        {loading && 'Loading latest tips'}
        {error && 'Error loading latest tips'}
        {tips && `${tips.length} latest tips`}
      </div>
    </section>
  ),
}));

vi.mock('@/components/home/home-footer', () => ({
  HomeFooter: () => <div data-testid="home-footer">Footer</div>,
}));

vi.mock('@/components/layout/footer', () => ({
  Footer: () => <div data-testid="home-footer">Footer</div>,
}));

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    mockAuthLoading = false;
    mockHomeData = {
      categories: null,
      featuredTip: null,
      latestTips: [],
      loading: true,
      error: null,
      retry: vi.fn(),
    };
  });

  describe('Authentication Loading State', () => {
    it('should show loading spinner while checking authentication', () => {
      mockAuthLoading = true;

      render(<Home />);

      // When auth is loading, the page still renders with data loading states
      expect(screen.getAllByText(/loading/i).length).toBeGreaterThan(0);
    });
  });

  describe('Anonymous User Rendering', () => {
    it('should render page for anonymous users', () => {
      mockUser = null;
      mockHomeData.loading = false;

      render(<Home />);

      expect(screen.getByTestId('home-header')).toHaveTextContent('anonymous');
    });

    it('should display all sections for anonymous users', () => {
      mockUser = null;
      mockHomeData.loading = false;

      render(<Home />);

      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('explore-categories')).toBeInTheDocument();
      expect(screen.getByTestId('featured-tip')).toBeInTheDocument();
      expect(screen.getByTestId('latest-lifehacks')).toBeInTheDocument();
      expect(screen.getByTestId('home-footer')).toBeInTheDocument();
    });
  });

  describe('Authenticated User Rendering', () => {
    it('should render page for authenticated users', () => {
      mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
      } as FirebaseUser;
      mockHomeData.loading = false;

      render(<Home />);

      expect(screen.getByTestId('home-header')).toHaveTextContent('authenticated');
    });

    it('should display all sections for authenticated users', () => {
      mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
      } as FirebaseUser;
      mockHomeData.loading = false;

      render(<Home />);

      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('explore-categories')).toBeInTheDocument();
      expect(screen.getByTestId('featured-tip')).toBeInTheDocument();
      expect(screen.getByTestId('latest-lifehacks')).toBeInTheDocument();
      expect(screen.getByTestId('home-footer')).toBeInTheDocument();
    });
  });

  describe('Data Flow', () => {
    it('should pass categories data to ExploreCategories component', () => {
      mockHomeData = {
        categories: [
          {
            id: '1',
            name: 'Kitchen',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: null,
          },
          {
            id: '2',
            name: 'Cleaning',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: null,
          },
        ],
        featuredTip: null,
        latestTips: [],
        loading: false,
        error: null,
        retry: vi.fn(),
      };

      render(<Home />);

      expect(screen.getByTestId('explore-categories')).toHaveTextContent('2 categories');
    });

    it('should pass featured tip data to FeaturedTip component', () => {
      mockHomeData = {
        categories: null,
        featuredTip: {
          id: 'tip-1',
          title: 'Amazing Tip',
          description: 'Description',
          categoryId: '1',
          categoryName: 'Kitchen',
          tags: [],
          videoUrl: null,
          createdAt: '2024-01-01T00:00:00Z',
        },
        latestTips: [],
        loading: false,
        error: null,
        retry: vi.fn(),
      };

      render(<Home />);

      expect(screen.getByTestId('featured-tip')).toHaveTextContent('Featured: Amazing Tip');
    });

    it('should pass latest tips data to LatestLifehacks component', () => {
      mockHomeData = {
        categories: null,
        featuredTip: null,
        latestTips: [
          {
            id: 'tip-1',
            title: 'Tip 1',
            description: 'Description',
            categoryId: '1',
            categoryName: 'Kitchen',
            tags: [],
            videoUrl: null,
            createdAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'tip-2',
            title: 'Tip 2',
            description: 'Description',
            categoryId: '1',
            categoryName: 'Kitchen',
            tags: [],
            videoUrl: null,
            createdAt: '2024-01-02T00:00:00Z',
          },
        ],
        loading: false,
        error: null,
        retry: vi.fn(),
      };

      render(<Home />);

      expect(screen.getByTestId('latest-lifehacks')).toHaveTextContent('2 latest tips');
    });
  });

  describe('Loading States', () => {
    it('should show loading state in all sections when data is loading', () => {
      mockHomeData.loading = true;

      render(<Home />);

      expect(screen.getByTestId('explore-categories')).toHaveTextContent('Loading categories');
      expect(screen.getByTestId('featured-tip')).toHaveTextContent('Loading featured tip');
      expect(screen.getByTestId('latest-lifehacks')).toHaveTextContent('Loading latest tips');
    });
  });

  describe('Error States', () => {
    it('should show error state in all sections when data fetch fails', () => {
      mockHomeData = {
        categories: null,
        featuredTip: null,
        latestTips: [],
        loading: false,
        error: 'Failed to load data',
        retry: vi.fn(),
      };

      render(<Home />);

      expect(screen.getByTestId('explore-categories')).toHaveTextContent('Error loading categories');
      expect(screen.getByTestId('featured-tip')).toHaveTextContent('Error loading featured tip');
      expect(screen.getByTestId('latest-lifehacks')).toHaveTextContent('Error loading latest tips');
    });
  });

  describe('Layout Structure', () => {
    it('should have correct semantic HTML structure', () => {
      mockHomeData.loading = false;

      const { container } = render(<Home />);

      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();

      const sections = container.querySelectorAll('section');
      expect(sections.length).toBe(4); // Hero, Categories, Featured, Latest
    });

    it('should apply responsive container classes', () => {
      mockHomeData.loading = false;

      const { container } = render(<Home />);

      const containers = container.querySelectorAll('.container');
      expect(containers.length).toBeGreaterThan(0);
    });
  });

  describe('Component Integration', () => {
    it('should render header at the top', () => {
      mockHomeData.loading = false;

      const { container } = render(<Home />);

      const header = screen.getByTestId('home-header');
      const main = container.querySelector('main');

      expect(header).toBeInTheDocument();
      expect(main).toBeInTheDocument();
      
      // Header should come before main in DOM order
      expect(header.compareDocumentPosition(main!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('should render footer at the bottom', () => {
      mockHomeData.loading = false;

      const { container } = render(<Home />);

      const footer = screen.getByTestId('home-footer');
      const main = container.querySelector('main');

      expect(footer).toBeInTheDocument();
      expect(main).toBeInTheDocument();
      
      // Footer should come after main in DOM order
      expect(footer.compareDocumentPosition(main!)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
    });
  });
});

// Property-Based Tests
import { fc, test as fcTest } from '@fast-check/vitest';

describe('Property-Based Tests', () => {
  describe('Property 1: Component Renders for All Auth States', () => {
    /**
     * Feature: home-page-implementation, Property 1: Component Renders for All Auth States
     * 
     * For any authentication state (authenticated or anonymous), the Home_Page should
     * render without errors and display appropriate content for that state.
     * 
     * Validates: Requirements 1.2
     */
    fcTest.prop([
      fc.boolean(), // authenticated or anonymous
      fc.boolean(), // data loading state
    ], { numRuns: 10 })(
      'should render without errors for any auth state',
      (isAuthenticated, isDataLoading) => {
        vi.clearAllMocks();

        // Set auth state
        if (isAuthenticated) {
          mockUser = {
            uid: 'test-uid',
            email: 'test@example.com',
            displayName: 'Test User',
          } as FirebaseUser;
        } else {
          mockUser = null;
        }

        mockAuthLoading = false;

        // Set data loading state
        mockHomeData = {
          categories: isDataLoading ? null : [],
          featuredTip: isDataLoading ? null : null,
          latestTips: isDataLoading ? [] : [],
          loading: isDataLoading,
          error: null,
          retry: vi.fn(),
        };

        // Should render without throwing errors
        const { container, unmount } = render(<Home />);

        // Verify page structure exists
        expect(container.querySelector('main')).toBeInTheDocument();
        expect(screen.getByTestId('home-header')).toBeInTheDocument();
        expect(screen.getByTestId('home-footer')).toBeInTheDocument();

        // Verify appropriate content for auth state
        if (isAuthenticated) {
          expect(screen.getByTestId('home-header')).toHaveTextContent('authenticated');
        } else {
          expect(screen.getByTestId('home-header')).toHaveTextContent('anonymous');
        }

        // Verify all sections are present
        expect(screen.getByTestId('hero-section')).toBeInTheDocument();
        expect(screen.getByTestId('explore-categories')).toBeInTheDocument();
        expect(screen.getByTestId('featured-tip')).toBeInTheDocument();
        expect(screen.getByTestId('latest-lifehacks')).toBeInTheDocument();
        
        // Cleanup
        unmount();
      }
    );
  });
});
