/**
 * TipEditClient Component Tests
 * 
 * Tests for the TipEditClient component that manages tip editing state.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TipEditClient } from './tip-edit-client';
import type { TipDetailResponse } from '@/lib/types/admin-tip';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockPathname = vi.fn(() => '/admin/tips/tip-123/edit');
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
vi.mock('@/lib/api/admin-tip', () => ({
  fetchTipById: vi.fn(),
  uploadTipImage: vi.fn(),
  updateTip: vi.fn(),
  fetchCategories: vi.fn(),
}));

// Import after mocking
const { fetchTipById, fetchCategories } = await import('@/lib/api/admin-tip');
const mockFetchTipById = fetchTipById as ReturnType<typeof vi.fn>;
const mockFetchCategories = fetchCategories as ReturnType<typeof vi.fn>;

describe('TipEditClient', () => {
  const mockIdToken = 'mock-id-token-123';
  const mockUser = { uid: 'user-123', email: 'admin@example.com' };
  const mockTipId = 'tip-123';
  
  const mockTipData: TipDetailResponse = {
    id: mockTipId,
    title: 'Test Tip',
    description: 'Test description',
    steps: [
      { stepNumber: 1, description: 'Step 1' },
      { stepNumber: 2, description: 'Step 2' },
    ],
    categoryId: 'cat-123',
    categoryName: 'Test Category',
    tags: ['test', 'example'],
    videoUrl: 'https://www.youtube.com/shorts/abc123',
    videoUrlId: 'abc123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    image: {
      imageUrl: 'https://example.com/image.jpg',
      imageStoragePath: 'tips/image.jpg',
      originalFileName: 'image.jpg',
      contentType: 'image/jpeg',
      fileSizeBytes: 1024,
      uploadedAt: '2024-01-01T00:00:00Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetchCategories to return empty array by default
    mockFetchCategories.mockResolvedValue([]);
  });

  describe('TipEditClient_ShouldDisplayLoadingState_WhenFetchingTip', () => {
    it('should display loading spinner and message when fetching tip', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      // Mock a delayed response
      mockFetchTipById.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockTipData), 100))
      );

      render(<TipEditClient tipId={mockTipId} />);

      // Verify loading state is displayed
      expect(screen.getByText('Loading tip...')).toBeInTheDocument();
      // "Edit Tip" heading is NOT in TipEditClient (it's in the page component)
      expect(screen.queryByText('Edit Tip')).not.toBeInTheDocument();
    });
  });

  describe('TipEditClient_ShouldFetchTipData_WhenUserIsAuthenticated', () => {
    it('should fetch tip data when user is authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchTipById.mockResolvedValue(mockTipData);

      render(<TipEditClient tipId={mockTipId} />);

      // Wait for fetch to be called
      await waitFor(() => {
        expect(mockFetchTipById).toHaveBeenCalledWith(mockTipId, mockIdToken);
      });
    });
  });

  describe('TipEditClient_ShouldNotFetch_WhenUserIsNotAuthenticated', () => {
    it('should not fetch tip data when idToken is null', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: null,
        loading: false,
        error: null,
      });

      render(<TipEditClient tipId={mockTipId} />);

      // Should not call fetch
      await waitFor(() => {
        expect(mockFetchTipById).not.toHaveBeenCalled();
      });
    });
  });

  describe('TipEditClient_ShouldDisplay404Error_WhenTipNotFound', () => {
    it('should display 404 error message when tip is not found', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchTipById.mockRejectedValue({
        status: 404,
        message: 'Tip not found',
      });

      render(<TipEditClient tipId={mockTipId} />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Tip not found')).toBeInTheDocument();
        expect(screen.getByText("The tip you're looking for doesn't exist or has been deleted.")).toBeInTheDocument();
      });
    });

    it('should display Back to Tips button on 404 error', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchTipById.mockRejectedValue({
        status: 404,
        message: 'Tip not found',
      });

      render(<TipEditClient tipId={mockTipId} />);

      // Wait for button to appear
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to tips/i });
        expect(backButton).toBeInTheDocument();
      });
    });

    it('should navigate to tips list when Back to Tips button is clicked', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchTipById.mockRejectedValue({
        status: 404,
        message: 'Tip not found',
      });

      render(<TipEditClient tipId={mockTipId} />);

      // Wait for button to appear and click it
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to tips/i });
        backButton.click();
      });

      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith('/admin/tips');
    });
  });

  describe('TipEditClient_ShouldDisplayGenericError_WhenFetchFails', () => {
    it('should display error message when fetch fails with non-404 error', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      const errorMessage = 'Network error. Please check your connection.';
      mockFetchTipById.mockRejectedValue({
        status: 500,
        message: errorMessage,
      });

      render(<TipEditClient tipId={mockTipId} />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Failed to Load Tip')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong while loading the tip. Please try again.')).toBeInTheDocument();
      });
    });

    it('should display generic error when error has no message', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchTipById.mockRejectedValue({});

      render(<TipEditClient tipId={mockTipId} />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Failed to Load Tip')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong while loading the tip. Please try again.')).toBeInTheDocument();
      });
    });

    it('should display retry button on generic error', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchTipById.mockRejectedValue({
        status: 500,
        message: 'Server error',
      });

      render(<TipEditClient tipId={mockTipId} />);

      // Wait for button to appear
      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /retry/i });
        expect(retryButton).toBeInTheDocument();
      });
    });
  });

  describe('TipEditClient_ShouldRetry_WhenRetryButtonClicked', () => {
    it('should retry fetching tip when retry button is clicked', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      // First call fails
      mockFetchTipById.mockRejectedValueOnce({
        status: 500,
        message: 'Network error',
      });
      // Second call succeeds
      mockFetchTipById.mockResolvedValueOnce(mockTipData);

      render(<TipEditClient tipId={mockTipId} />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Failed to Load Tip')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      retryButton.click();

      // Should call fetch again
      await waitFor(() => {
        expect(mockFetchTipById).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('TipEditClient_ShouldRenderTipForm_WhenFetchSucceeds', () => {
    it('should render TipForm with correct props when fetch succeeds', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchTipById.mockResolvedValue(mockTipData);

      render(<TipEditClient tipId={mockTipId} />);

      // Wait for form to render - check for form elements instead of page description
      await waitFor(() => {
        // The form should have the "Update Tip" submit button
        expect(screen.getByRole('button', { name: /update tip/i })).toBeInTheDocument();
      });
    });
  });

  describe('TipEditClient_ShouldDisplayBreadcrumb_WhenRendered', () => {
    it('should not render breadcrumb navigation (handled by page component)', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchTipById.mockResolvedValue(mockTipData);

      render(<TipEditClient tipId={mockTipId} />);

      // Wait for form to render - check for form elements
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /update tip/i })).toBeInTheDocument();
      });

      // Breadcrumb should NOT be in TipEditClient (it's in the page component)
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Tips Management')).not.toBeInTheDocument();
    });
  });

  describe('TipEditClient_ShouldClearError_WhenRetrying', () => {
    it('should clear error state when retrying', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      // First call fails
      mockFetchTipById.mockRejectedValueOnce({
        status: 500,
        message: 'Network error',
      });
      // Second call takes time (simulating loading)
      mockFetchTipById.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockTipData), 100))
      );

      render(<TipEditClient tipId={mockTipId} />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Something went wrong while loading the tip. Please try again.')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      retryButton.click();

      // Error should be cleared (component shows loading state)
      await waitFor(() => {
        expect(screen.queryByText('Something went wrong while loading the tip. Please try again.')).not.toBeInTheDocument();
      });
    });
  });

  describe('TipEditClient_ShouldNotRenderLayout_WhenInErrorState', () => {
    it('should not render Header, Footer, and Breadcrumb in 404 error state (handled by page component)', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchTipById.mockRejectedValue({
        status: 404,
        message: 'Tip not found',
      });

      render(<TipEditClient tipId={mockTipId} />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Tip not found')).toBeInTheDocument();
      });

      // Verify layout elements are NOT in TipEditClient (they're in the page component)
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Tips Management')).not.toBeInTheDocument();
    });

    it('should not render Header, Footer, and Breadcrumb in generic error state (handled by page component)', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        idToken: mockIdToken,
        loading: false,
        error: null,
      });

      mockFetchTipById.mockRejectedValue({
        status: 500,
        message: 'Server error',
      });

      render(<TipEditClient tipId={mockTipId} />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Failed to Load Tip')).toBeInTheDocument();
      });

      // Verify layout elements are NOT in TipEditClient (they're in the page component)
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Tips Management')).not.toBeInTheDocument();
    });
  });
});
