/**
 * Dashboard Client Component Tests
 * 
 * Tests for the DashboardClient component that manages dashboard state.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DashboardClient } from './dashboard-client';
import type { DashboardResponse } from '@/lib/types/admin-dashboard';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockPathname = vi.fn(() => '/admin');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => mockPathname(),
  useSearchParams: () => new URLSearchParams(),
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

// Mock API functions
vi.mock('@/lib/api/admin-dashboard', () => ({
  fetchDashboardStatistics: vi.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Import after mocking
const { fetchDashboardStatistics } = await import('@/lib/api/admin-dashboard');
const mockFetchDashboardStatistics = fetchDashboardStatistics as ReturnType<typeof vi.fn>;

describe('DashboardClient', () => {
  const mockIdToken = 'mock-id-token-123';
  const mockUser = { uid: 'user-123', email: 'admin@example.com' };
  
  const mockStatistics: DashboardResponse = {
    users: {
      total: 100,
      lastDay: 2,
      thisDay: 3,
      lastWeek: 8,
      thisWeek: 10,
      lastMonth: 8,
      thisMonth: 10,
      lastYear: 80,
      thisYear: 100,
    },
    categories: {
      total: 20,
      lastDay: 0,
      thisDay: 1,
      lastWeek: 2,
      thisWeek: 2,
      lastMonth: 2,
      thisMonth: 2,
      lastYear: 18,
      thisYear: 20,
    },
    tips: {
      total: 500,
      lastDay: 10,
      thisDay: 15,
      lastWeek: 45,
      thisWeek: 50,
      lastMonth: 45,
      thisMonth: 50,
      lastYear: 450,
      thisYear: 500,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('DashboardClient_ShouldFetchStatistics_WhenUserIsAuthenticated', () => {
    it('should fetch and display statistics when user is authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchDashboardStatistics.mockResolvedValue(mockStatistics);

      render(<DashboardClient />);

      await waitFor(() => {
        expect(mockFetchDashboardStatistics).toHaveBeenCalledWith(mockIdToken);
      });

      await waitFor(() => {
        expect(screen.getByText('Total Tips')).toBeInTheDocument();
        expect(screen.getByText('Happy Users')).toBeInTheDocument();
        expect(screen.getByText('Active Categories')).toBeInTheDocument();
      });
    });
  });

  describe('DashboardClient_ShouldNotFetch_WhenUserIsNotAuthenticated', () => {
    it('should not fetch statistics when user is null', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        idToken: null,
        loading: false,
        error: null,
      });

      render(<DashboardClient />);

      await waitFor(() => {
        expect(mockFetchDashboardStatistics).not.toHaveBeenCalled();
      });
    });

    it('should not fetch statistics when idToken is null', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: null,
        loading: false,
        error: null,
      });

      render(<DashboardClient />);

      await waitFor(() => {
        expect(mockFetchDashboardStatistics).not.toHaveBeenCalled();
      });
    });
  });

  describe('DashboardClient_ShouldDisplayError_WhenFetchFails', () => {
    it('should display error message when fetch fails', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      const errorMessage = 'Network error. Please check your connection.';
      mockFetchDashboardStatistics.mockRejectedValue(new Error(errorMessage));

      render(<DashboardClient />);

      await waitFor(() => {
        expect(screen.getByText('Failed to Load Statistics')).toBeInTheDocument();
        expect(screen.getByText('Failed to load statistics. Please try again.')).toBeInTheDocument();
      });
    });

    it('should display generic error when error has no message', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchDashboardStatistics.mockRejectedValue({});

      render(<DashboardClient />);

      await waitFor(() => {
        expect(screen.getByText('Failed to Load Statistics')).toBeInTheDocument();
        expect(screen.getByText('Failed to load statistics. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('DashboardClient_ShouldRetry_WhenRetryButtonClicked', () => {
    it('should retry fetching statistics when retry button is clicked', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchDashboardStatistics.mockRejectedValueOnce(
        new Error('Network error')
      );
      mockFetchDashboardStatistics.mockResolvedValueOnce(mockStatistics);

      render(<DashboardClient />);

      await waitFor(() => {
        expect(screen.getByText('Failed to Load Statistics')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockFetchDashboardStatistics).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('DashboardClient_ShouldLoadPreferences_FromLocalStorage', () => {
    it('should load period preference from localStorage on mount', async () => {
      localStorageMock.setItem('dashboard_period', 'week');
      
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchDashboardStatistics.mockResolvedValue(mockStatistics);

      const { container } = render(<DashboardClient />);

      await waitFor(() => {
        const weekButton = container.querySelector('[data-testid="period-week"]');
        expect(weekButton).toHaveClass('bg-primary');
      });
    });

    it('should load statistics type preference from localStorage on mount', async () => {
      localStorageMock.setItem('dashboard_statistics_type', 'percentage');
      
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchDashboardStatistics.mockResolvedValue(mockStatistics);

      const { container } = render(<DashboardClient />);

      await waitFor(() => {
        const percentageButton = container.querySelector('[data-testid="type-percentage"]');
        expect(percentageButton).toHaveClass('bg-primary');
      });
    });

    it('should use default values when localStorage is empty', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchDashboardStatistics.mockResolvedValue(mockStatistics);

      const { container } = render(<DashboardClient />);

      await waitFor(() => {
        const monthButton = container.querySelector('[data-testid="period-month"]');
        expect(monthButton).toHaveClass('bg-primary');
        
        const amountButton = container.querySelector('[data-testid="type-amount"]');
        expect(amountButton).toHaveClass('bg-primary');
      });
    });
  });

  describe('DashboardClient_ShouldSavePreferences_ToLocalStorage', () => {
    it('should save period preference when changed', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchDashboardStatistics.mockResolvedValue(mockStatistics);

      const { container } = render(<DashboardClient />);

      await waitFor(() => {
        expect(screen.getByText('Total Tips')).toBeInTheDocument();
      });

      const dayButton = container.querySelector('[data-testid="period-day"]');
      fireEvent.click(dayButton!);

      expect(localStorageMock.getItem('dashboard_period')).toBe('day');
    });

    it('should save statistics type preference when changed', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchDashboardStatistics.mockResolvedValue(mockStatistics);

      const { container } = render(<DashboardClient />);

      await waitFor(() => {
        expect(screen.getByText('Total Tips')).toBeInTheDocument();
      });

      const percentageButton = container.querySelector('[data-testid="type-percentage"]');
      fireEvent.click(percentageButton!);

      expect(localStorageMock.getItem('dashboard_statistics_type')).toBe('percentage');
    });
  });

  describe('DashboardClient_ShouldRenderControls_Always', () => {
    it('should render dashboard controls component', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchDashboardStatistics.mockResolvedValue(mockStatistics);

      render(<DashboardClient />);

      await waitFor(() => {
        expect(screen.getByText('Period')).toBeInTheDocument();
        expect(screen.getByText('Display As')).toBeInTheDocument();
      });
    });
  });

  describe('DashboardClient_ShouldPassDataToGrid_WhenFetchSucceeds', () => {
    it('should pass statistics data to DashboardGrid component', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchDashboardStatistics.mockResolvedValue(mockStatistics);

      render(<DashboardClient />);

      await waitFor(() => {
        expect(screen.getByText('Total Tips')).toBeInTheDocument();
        expect(screen.getByText('Happy Users')).toBeInTheDocument();
        expect(screen.getByText('Active Categories')).toBeInTheDocument();
      });
    });
  });
});
