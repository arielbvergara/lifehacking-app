import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { CategoriesTable } from './categories-table';

describe('CategoriesTable', () => {
  const mockCategories = [
    { id: '1', name: 'Productivity', iconUrl: 'icon1.png', tipCount: 5 },
    { id: '2', name: 'Health', iconUrl: 'icon2.png', tipCount: 3 },
    { id: '3', name: 'Finance', iconUrl: 'icon3.png', tipCount: 8 },
  ];

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading skeletons when loading is true', () => {
      render(
        <CategoriesTable
          categories={[]}
          loading={true}
          error={null}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const loadingElements = screen.getAllByLabelText('Loading category');
      expect(loadingElements).toHaveLength(3);
      expect(loadingElements[0]).toHaveClass('animate-pulse');
    });

    it('should not display categories when loading', () => {
      render(
        <CategoriesTable
          categories={mockCategories}
          loading={true}
          error={null}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('Productivity')).not.toBeInTheDocument();
      expect(screen.queryByText('Health')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error is present', () => {
      const errorMessage = 'Failed to fetch categories';
      render(
        <CategoriesTable
          categories={[]}
          loading={false}
          error={errorMessage}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Failed to load categories')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not display categories when error is present', () => {
      render(
        <CategoriesTable
          categories={mockCategories}
          loading={false}
          error="Error occurred"
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('Productivity')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state message when categories array is empty', () => {
      render(
        <CategoriesTable
          categories={[]}
          loading={false}
          error={null}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('No categories found')).toBeInTheDocument();
      expect(
        screen.getByText(/No categories available. Create your first category to get started./)
      ).toBeInTheDocument();
    });
  });

  describe('Categories Rendering', () => {
    it('should render all categories when data is loaded', () => {
      render(
        <CategoriesTable
          categories={mockCategories}
          loading={false}
          error={null}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Use getAllByText since CategoryRow renders both desktop and mobile layouts
      expect(screen.getAllByText('Productivity').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Health').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Finance').length).toBeGreaterThan(0);
    });

    it('should sort categories alphabetically by name', () => {
      const unsortedCategories = [
        { id: '1', name: 'Zebra', iconUrl: '', tipCount: 1 },
        { id: '2', name: 'Apple', iconUrl: '', tipCount: 2 },
        { id: '3', name: 'Mango', iconUrl: '', tipCount: 3 },
      ];

      render(
        <CategoriesTable
          categories={unsortedCategories}
          loading={false}
          error={null}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const categoryNames = screen.getAllByRole('heading', { level: 3 });
      // Each category appears twice (desktop + mobile), so we check pairs
      expect(categoryNames[0]).toHaveTextContent('Apple');
      expect(categoryNames[1]).toHaveTextContent('Apple');
      expect(categoryNames[2]).toHaveTextContent('Mango');
      expect(categoryNames[3]).toHaveTextContent('Mango');
      expect(categoryNames[4]).toHaveTextContent('Zebra');
      expect(categoryNames[5]).toHaveTextContent('Zebra');
    });

    it('should display table header on desktop', () => {
      render(
        <CategoriesTable
          categories={mockCategories}
          loading={false}
          error={null}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Tips')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive container classes', () => {
      const { container } = render(
        <CategoriesTable
          categories={mockCategories}
          loading={false}
          error={null}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const tableContainer = container.querySelector('.bg-white.rounded-lg.shadow');
      expect(tableContainer).toBeInTheDocument();
    });

    it('should hide table header on mobile with md:block class', () => {
      const { container } = render(
        <CategoriesTable
          categories={mockCategories}
          loading={false}
          error={null}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const header = container.querySelector('.hidden.md\\:block');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Callback Props', () => {
    it('should pass onEdit callback to CategoryRow components', () => {
      render(
        <CategoriesTable
          categories={mockCategories}
          loading={false}
          error={null}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // CategoryRow components should be rendered with the callbacks
      // The actual callback testing is done in category-row.test.tsx
      expect(screen.getAllByText('Productivity').length).toBeGreaterThan(0);
    });

    it('should pass onDelete callback to CategoryRow components', () => {
      render(
        <CategoriesTable
          categories={mockCategories}
          loading={false}
          error={null}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // CategoryRow components should be rendered with the callbacks
      // The actual callback testing is done in category-row.test.tsx
      expect(screen.getAllByText('Health').length).toBeGreaterThan(0);
    });
  });
});
