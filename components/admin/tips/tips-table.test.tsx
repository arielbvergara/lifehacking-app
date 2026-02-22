import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TipsTable } from './tips-table';
import { TipSummary } from '@/lib/types/api';

// Mock child components
vi.mock('./tip-row', () => ({
  TipRow: ({ tip }: { tip: TipSummary }) => (
    <div data-testid="tip-row">{tip.title}</div>
  ),
}));

vi.mock('./tips-search', () => ({
  TipsSearch: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input
      data-testid="tips-search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('../shared/pagination', () => ({
  Pagination: ({ currentPage, totalItems }: { currentPage: number; totalItems: number }) => (
    <div data-testid="pagination">
      Page {currentPage} of {totalItems}
    </div>
  ),
}));

describe('TipsTable', () => {
  const mockTips: TipSummary[] = [
    {
      id: '1',
      title: 'Test Tip 1',
      description: 'Description 1',
      categoryId: 'cat-1',
      categoryName: 'Category 1',
      tags: ['tag1'],
      videoUrl: null,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Test Tip 2',
      description: 'Description 2',
      categoryId: 'cat-2',
      categoryName: 'Category 2',
      tags: ['tag2'],
      videoUrl: null,
      createdAt: '2024-01-02T00:00:00Z',
    },
  ];

  const defaultProps = {
    tips: mockTips,
    totalItems: 2,
    currentPage: 1,
    pageSize: 10,
    searchQuery: '',
    loading: false,
    onSearch: vi.fn(),
    onPageChange: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading skeletons when loading is true', () => {
      render(<TipsTable {...defaultProps} loading={true} tips={[]} />);

      const loadingElements = screen.getAllByLabelText('Loading tip');
      expect(loadingElements).toHaveLength(3);
    });

    it('should not display tips when loading', () => {
      render(<TipsTable {...defaultProps} loading={true} />);

      expect(screen.queryByTestId('tip-row')).not.toBeInTheDocument();
    });

    it('should not display pagination when loading', () => {
      render(<TipsTable {...defaultProps} loading={true} />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display "no results found" message when tips array is empty', () => {
      render(<TipsTable {...defaultProps} tips={[]} totalItems={0} />);

      expect(screen.getByText('No tips found')).toBeInTheDocument();
    });

    it('should display search-specific message when search query is present', () => {
      render(
        <TipsTable
          {...defaultProps}
          tips={[]}
          totalItems={0}
          searchQuery="nonexistent"
        />
      );

      expect(
        screen.getByText(/No tips match your search for "nonexistent"/)
      ).toBeInTheDocument();
    });

    it('should display generic message when no search query', () => {
      render(<TipsTable {...defaultProps} tips={[]} totalItems={0} />);

      expect(
        screen.getByText(/No tips available. Create your first tip to get started./)
      ).toBeInTheDocument();
    });

    it('should not display pagination when tips array is empty', () => {
      render(<TipsTable {...defaultProps} tips={[]} totalItems={0} />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  describe('Tips Rendering', () => {
    it('should render all tips in the array', () => {
      render(<TipsTable {...defaultProps} />);

      const tipRows = screen.getAllByTestId('tip-row');
      expect(tipRows).toHaveLength(2);
    });

    it('should render TipRow components with correct tip data', () => {
      render(<TipsTable {...defaultProps} />);

      expect(screen.getByText('Test Tip 1')).toBeInTheDocument();
      expect(screen.getByText('Test Tip 2')).toBeInTheDocument();
    });

    it('should display table header on desktop', () => {
      render(<TipsTable {...defaultProps} />);

      expect(screen.getByText('Tip Details')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('Search Component', () => {
    it('should include TipsSearch component', () => {
      render(<TipsTable {...defaultProps} />);

      expect(screen.getByTestId('tips-search')).toBeInTheDocument();
    });

    it('should pass searchQuery to TipsSearch', () => {
      render(<TipsTable {...defaultProps} searchQuery="test query" />);

      const searchInput = screen.getByTestId('tips-search') as HTMLInputElement;
      expect(searchInput.value).toBe('test query');
    });
  });

  describe('Pagination Component', () => {
    it('should include Pagination component when tips are present', () => {
      render(<TipsTable {...defaultProps} />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should pass correct props to Pagination', () => {
      render(
        <TipsTable
          {...defaultProps}
          currentPage={2}
          totalItems={50}
          pageSize={10}
        />
      );

      expect(screen.getByText(/Page 2 of 50/)).toBeInTheDocument();
    });

    it('should not display pagination when loading', () => {
      render(<TipsTable {...defaultProps} loading={true} />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should not display pagination when no tips', () => {
      render(<TipsTable {...defaultProps} tips={[]} totalItems={0} />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive table layout classes', () => {
      const { container } = render(<TipsTable {...defaultProps} />);

      // Check for responsive classes
      const tableHeader = container.querySelector('.hidden.md\\:block');
      expect(tableHeader).toBeInTheDocument();
    });
  });
});
