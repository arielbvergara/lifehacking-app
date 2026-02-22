/**
 * Dashboard Client Component Tests
 * 
 * Tests for the DashboardClient component that manages dashboard state.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

// Import after mocking
const { fetchDashboardStatistics } = await import('@/lib/api/admin-dashboard');
const mockFetchDashboardStatistics = fetchDashboardStatistics as ReturnType<typeof vi.fn>;

describe('DashboardClient', () => {
  const mockIdToken = 'mock-id-token-123';
  const mockUser = { uid: 'user-123', email: 'admin@example.com' };
  
  const mockStatistics: DashboardResponse = {
    users: { total: 100, thisMonth: 10, lastMonth: 8 },
    categories: { total: 20, thisMonth: 2, lastMonth: 2 },
    tips: { total: 500, thisMonth: 50, lastMonth: 45 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
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

      // Wait for statistics to load
      await waitFor(() => {
        expect(mockFetchDashboardStatistics).toHaveBeenCalledWith(mockIdToken);
      });

      // Verify statistics are displayed
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

      // Should not call fetch
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

      // Should not call fetch
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

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Failed to Load Statistics')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
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

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Failed to Load Statistics')).toBeInTheDocument();
        expect(screen.getByText('Failed to load statistics')).toBeInTheDocument();
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

      // First call fails
      mockFetchDashboardStatistics.mockRejectedValueOnce(
        new Error('Network error')
      );
      // Second call succeeds
      mockFetchDashboardStatistics.mockResolvedValueOnce(mockStatistics);

      render(<DashboardClient />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Failed to Load Statistics')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      retryButton.click();

      // Should call fetch again
      await waitFor(() => {
        expect(mockFetchDashboardStatistics).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('DashboardClient_ShouldClearError_WhenRetrying', () => {
    it('should clear error state when retrying', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      // First call fails
      mockFetchDashboardStatistics.mockRejectedValueOnce(
        new Error('Network error')
      );
      // Second call takes time (simulating loading)
      mockFetchDashboardStatistics.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockStatistics), 100))
      );

      render(<DashboardClient />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      retryButton.click();

      // Error should be cleared (component shows loading state)
      await waitFor(() => {
        expect(screen.queryByText('Network error')).not.toBeInTheDocument();
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

      // Wait for statistics to load and verify data is displayed
      await waitFor(() => {
        expect(screen.getByText('Total Tips')).toBeInTheDocument();
        expect(screen.getByText('Happy Users')).toBeInTheDocument();
        expect(screen.getByText('Active Categories')).toBeInTheDocument();
      });
    });
  });
});
