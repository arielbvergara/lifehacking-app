import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryEditClient } from './category-edit-client';
import { fetchCategoryById } from '@/lib/api/admin-category';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import type { CategoryResponse } from '@/lib/types/admin-category';

// Mock Firebase to avoid API key errors
vi.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

// Mock dependencies
vi.mock('@/lib/api/admin-category');
vi.mock('@/lib/auth/auth-context');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock child components
vi.mock('@/components/admin/category-form', () => ({
  CategoryForm: ({ mode, initialData, categoryId }: { mode: string; initialData: unknown; categoryId: string }) => (
    <div data-testid="category-form">
      <span data-testid="form-mode">{mode}</span>
      <span data-testid="form-category-id">{categoryId}</span>
      <span data-testid="form-initial-data">{initialData?.name}</span>
    </div>
  ),
}));

vi.mock('@/components/layout/header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('@/components/shared/breadcrumb', () => ({
  Breadcrumb: ({ items }: { items: Array<{ label: string; href?: string }> }) => (
    <nav data-testid="breadcrumb">
      {items.map((item: { label: string; href?: string }, idx: number) => (
        <span key={idx}>{item.label}</span>
      ))}
    </nav>
  ),
}));

describe('CategoryEditClient', () => {
  const mockCategoryId = 'cat-123';
  const mockIdToken = 'mock-token';
  const mockPush = vi.fn();

  const mockCategoryData: CategoryResponse = {
    id: mockCategoryId,
    name: 'Test Category',
    image: {
      imageUrl: 'https://example.com/image.jpg',
      imageStoragePath: 'categories/test.jpg',
    },
  };

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      idToken: mockIdToken,
      user: { uid: 'user-123', email: 'test@example.com' },
      loading: false,
      isAdmin: true,
    });

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('CategoryEditClient_ShouldDisplayLoadingState_WhenFetchingData', () => {
    it('displays loading spinner and message', async () => {
      vi.mocked(fetchCategoryById).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      expect(screen.getByText('Loading category...')).toBeInTheDocument();
      expect(screen.getByRole('main')).toContainHTML('animate-spin');
    });

    it('displays header, footer, and breadcrumb during loading', async () => {
      vi.mocked(fetchCategoryById).mockImplementation(
        () => new Promise(() => {})
      );

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    });
  });

  describe('CategoryEditClient_ShouldFetchCategoryData_WhenMounted', () => {
    it('calls fetchCategoryById with correct parameters', async () => {
      vi.mocked(fetchCategoryById).mockResolvedValue(mockCategoryData);

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      await waitFor(() => {
        expect(fetchCategoryById).toHaveBeenCalledWith(mockCategoryId, mockIdToken);
      });
    });

    it('does not fetch when idToken is not available', async () => {
      vi.mocked(useAuth).mockReturnValue({
        idToken: null,
        user: null,
        loading: false,
        isAdmin: false,
      });

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      await waitFor(() => {
        expect(fetchCategoryById).not.toHaveBeenCalled();
      });
    });
  });

  describe('CategoryEditClient_ShouldDisplayCategoryForm_WhenDataLoaded', () => {
    it('renders CategoryForm with edit mode', async () => {
      vi.mocked(fetchCategoryById).mockResolvedValue(mockCategoryData);

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      await waitFor(() => {
        expect(screen.getByTestId('category-form')).toBeInTheDocument();
      });

      expect(screen.getByTestId('form-mode')).toHaveTextContent('edit');
    });

    it('passes categoryId to CategoryForm', async () => {
      vi.mocked(fetchCategoryById).mockResolvedValue(mockCategoryData);

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      await waitFor(() => {
        expect(screen.getByTestId('form-category-id')).toHaveTextContent(mockCategoryId);
      });
    });

    it('passes fetched data as initialData to CategoryForm', async () => {
      vi.mocked(fetchCategoryById).mockResolvedValue(mockCategoryData);

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      await waitFor(() => {
        expect(screen.getByTestId('form-initial-data')).toHaveTextContent('Test Category');
      });
    });

    it('displays page heading and description', async () => {
      vi.mocked(fetchCategoryById).mockResolvedValue(mockCategoryData);

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Edit Category' })).toBeInTheDocument();
        expect(screen.getByText('Update category details')).toBeInTheDocument();
      });
    });
  });

  describe('CategoryEditClient_ShouldDisplay404Error_WhenCategoryNotFound', () => {
    it('displays 404 error message when status is 404', async () => {
      vi.mocked(fetchCategoryById).mockRejectedValue({
        status: 404,
        message: 'Category not found',
      });

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      await waitFor(() => {
        expect(screen.getByText('Category not found')).toBeInTheDocument();
      });

      expect(screen.getByText(/doesn't exist or has been deleted/)).toBeInTheDocument();
    });

    it('displays Back to Categories button on 404', async () => {
      vi.mocked(fetchCategoryById).mockRejectedValue({
        status: 404,
        message: 'Category not found',
      });

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      await waitFor(() => {
        expect(screen.getByText('Back to Categories')).toBeInTheDocument();
      });
    });

    it('navigates to categories list when Back button clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(fetchCategoryById).mockRejectedValue({
        status: 404,
        message: 'Category not found',
      });

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      await waitFor(() => {
        expect(screen.getByText('Back to Categories')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back to Categories');
      await user.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/admin/categories');
    });
  });

  describe('CategoryEditClient_ShouldDisplayGenericError_WhenOtherErrorOccurs', () => {
    it('displays error message for non-404 errors', async () => {
      vi.mocked(fetchCategoryById).mockRejectedValue({
        status: 500,
        message: 'Internal server error',
      });

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to Load Category')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong while loading the category. Please try again.')).toBeInTheDocument();
      });
    });

    it('displays default error message when message is not provided', async () => {
      vi.mocked(fetchCategoryById).mockRejectedValue({
        status: 500,
      });

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      await waitFor(() => {
        expect(screen.getByText('Something went wrong while loading the category. Please try again.')).toBeInTheDocument();
      });
    });

    it('displays Retry button on error', async () => {
      vi.mocked(fetchCategoryById).mockRejectedValue({
        status: 500,
        message: 'Server error',
      });

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('retries fetching data when Retry button clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(fetchCategoryById)
        .mockRejectedValueOnce({
          status: 500,
          message: 'Server error',
        })
        .mockResolvedValueOnce(mockCategoryData);

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      await waitFor(() => {
        expect(fetchCategoryById).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId('category-form')).toBeInTheDocument();
      });
    });
  });

  describe('CategoryEditClient_ShouldDisplayCorrectBreadcrumb_WhenRendered', () => {
    it('displays breadcrumb with correct items', async () => {
      vi.mocked(fetchCategoryById).mockResolvedValue(mockCategoryData);

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      await waitFor(() => {
        const breadcrumb = screen.getByTestId('breadcrumb');
        expect(breadcrumb.textContent).toContain('Home');
        expect(breadcrumb.textContent).toContain('Admin');
        expect(breadcrumb.textContent).toContain('Categories');
        expect(breadcrumb.textContent).toContain('Edit Category');
      });
    });
  });

  describe('CategoryEditClient_ShouldIncludeLayoutComponents_WhenRendered', () => {
    it('includes Header component in all states', async () => {
      vi.mocked(fetchCategoryById).mockResolvedValue(mockCategoryData);

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      expect(screen.getByTestId('header')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
      });
    });

    it('includes Footer component in all states', async () => {
      vi.mocked(fetchCategoryById).mockResolvedValue(mockCategoryData);

      render(<CategoryEditClient categoryId={mockCategoryId} />);

      expect(screen.getByTestId('footer')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });
  });
});
