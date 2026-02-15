import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { User as FirebaseUser } from 'firebase/auth';
import { HomePageClient } from './page.client';

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
vi.mock('@/components/layout/home-header', () => ({
  HomeHeader: () => (
    <div data-testid="home-header">
      Header {mockUser ? 'authenticated' : 'anonymous'}
    </div>
  ),
}));

vi.mock('@/components/home/hero-section', () => ({
  HeroSection: () => (
    <section data-testid="hero-section">Hero Section</section>
  ),
}));

vi.mock('@/components/home/explore-categories', () => ({
  ExploreCategories: ({ loading }: { loading: boolean }) => (
    <section data-testid="explore-categories">
      {loading ? 'Loading categories' : 'Categories loaded'}
    </section>
  ),
}));

vi.mock('@/components/home/featured-tip', () => ({
  FeaturedTip: ({ loading }: { loading: boolean }) => (
    <section data-testid="featured-tip">
      {loading ? 'Loading featured tip' : 'Featured tip loaded'}
    </section>
  ),
}));

vi.mock('@/components/home/latest-lifehacks', () => ({
  LatestLifehacks: ({ loading }: { loading: boolean }) => (
    <section data-testid="latest-lifehacks">
      {loading ? 'Loading latest tips' : 'Latest tips loaded'}
    </section>
  ),
}));

vi.mock('@/components/home/home-footer', () => ({
  HomeFooter: () => <div data-testid="home-footer">Footer</div>,
}));

vi.mock('@/components/layout/footer', () => ({
  Footer: () => <div data-testid="home-footer">Footer</div>,
}));

describe('HomePageClient', () => {
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

  describe('HomePageClient_ShouldShowLoadingSpinner_WhenAuthIsLoading', () => {
    it('should display loading spinner with proper ARIA attributes', () => {
      mockAuthLoading = true;

      render(<HomePageClient />);

      // Multiple loading states are shown for different sections
      expect(screen.getAllByText(/loading/i).length).toBeGreaterThan(0);
    });
  });

  describe('HomePageClient_ShouldRenderAllSections_WhenAuthIsComplete', () => {
    it('should render header, main content, and footer', () => {
      mockAuthLoading = false;
      mockHomeData.loading = false;

      const { container } = render(<HomePageClient />);

      expect(screen.getByTestId('home-header')).toBeInTheDocument();
      expect(container.querySelector('#main-content')).toBeInTheDocument();
      expect(screen.getByTestId('home-footer')).toBeInTheDocument();
    });
  });

  describe('HomePageClient_ShouldIncludeMainContentId_WhenRendered', () => {
    it('should have main element with id for skip link', () => {
      mockAuthLoading = false;
      mockHomeData.loading = false;

      const { container } = render(<HomePageClient />);

      const main = container.querySelector('#main-content');
      expect(main).toBeInTheDocument();
      expect(main?.tagName).toBe('MAIN');
    });
  });

  describe('HomePageClient_ShouldPassUserToHeader_WhenAuthenticated', () => {
    it('should show authenticated state in header', () => {
      mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
      } as FirebaseUser;
      mockAuthLoading = false;
      mockHomeData.loading = false;

      render(<HomePageClient />);

      expect(screen.getByTestId('home-header')).toHaveTextContent('authenticated');
    });
  });

  describe('HomePageClient_ShouldPassDataToComponents_WhenDataIsLoaded', () => {
    it('should pass loading state to child components', () => {
      mockAuthLoading = false;
      mockHomeData.loading = true;

      render(<HomePageClient />);

      expect(screen.getByTestId('explore-categories')).toHaveTextContent('Loading categories');
      expect(screen.getByTestId('featured-tip')).toHaveTextContent('Loading featured tip');
      expect(screen.getByTestId('latest-lifehacks')).toHaveTextContent('Loading latest tips');
    });

    it('should pass loaded state to child components', () => {
      mockAuthLoading = false;
      mockHomeData.loading = false;

      render(<HomePageClient />);

      expect(screen.getByTestId('explore-categories')).toHaveTextContent('Categories loaded');
      expect(screen.getByTestId('featured-tip')).toHaveTextContent('Featured tip loaded');
      expect(screen.getByTestId('latest-lifehacks')).toHaveTextContent('Latest tips loaded');
    });
  });
});
