import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ExploreCategories } from './explore-categories';
import { Category } from '@/lib/types/api';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Kitchen',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
  },
  {
    id: '2',
    name: 'Cleaning',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: null,
  },
  {
    id: '3',
    name: 'Tech Help',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: null,
  },
];

describe('ExploreCategories', () => {
  it('should render section title and subtitle', () => {
    render(
      <ExploreCategories
        categories={mockCategories}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('Explore Categories')).toBeInTheDocument();
    expect(
      screen.getByText('Find simple tricks for every area of your life')
    ).toBeInTheDocument();
  });

  it('should render "View all" link', () => {
    render(
      <ExploreCategories
        categories={mockCategories}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    const viewAllLink = screen.getByText(/view all/i);
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink).toHaveAttribute('href', '/categories');
  });

  it('should display loading state with skeleton cards', () => {
    render(
      <ExploreCategories
        categories={null}
        loading={true}
        error={null}
        onRetry={vi.fn()}
      />
    );

    // Should show skeleton loaders (6 by default)
    const skeletons = screen.getAllByRole('generic').filter((el) =>
      el.className.includes('animate-pulse')
    );
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display error state with retry button', () => {
    const errorMessage = 'Failed to load categories';
    render(
      <ExploreCategories
        categories={null}
        loading={false}
        error={errorMessage}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();

    render(
      <ExploreCategories
        categories={null}
        loading={false}
        error="Failed to load"
        onRetry={handleRetry}
      />
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should display category cards when data is loaded', () => {
    render(
      <ExploreCategories
        categories={mockCategories}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('Kitchen')).toBeInTheDocument();
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Tech Help')).toBeInTheDocument();
  });

  it('should not display loading state when data is present', () => {
    render(
      <ExploreCategories
        categories={mockCategories}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    const skeletons = screen.queryAllByRole('generic').filter((el) =>
      el.className.includes('animate-pulse')
    );
    expect(skeletons.length).toBe(0);
  });

  it('should not display error state when data is present', () => {
    render(
      <ExploreCategories
        categories={mockCategories}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();
  });

  it('should render empty grid when categories array is empty', () => {
    render(
      <ExploreCategories
        categories={[]}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    // Section should still render with title
    expect(screen.getByText('Explore Categories')).toBeInTheDocument();
    
    // But no category cards
    expect(screen.queryByText('Kitchen')).not.toBeInTheDocument();
  });
});

// Property-Based Tests
import { fc, test } from '@fast-check/vitest';

// Feature: home-page-implementation, Property 2: List Rendering Completeness
// **Validates: Requirements 3.4**
describe('ExploreCategories - Property Tests', () => {
  test.prop([
    fc.array(
      fc.record({
        id: fc.uuid(),
        name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        createdAt: fc.date().map(d => d.toISOString()),
        updatedAt: fc.constantFrom(null, fc.date().map(d => d.toISOString())),
      }),
      { minLength: 1, maxLength: 20 }
    ),
  ])(
    'should render exactly one CategoryCard for each category in the list',
    (categories) => {
      const { unmount } = render(
        <ExploreCategories
          categories={categories}
          loading={false}
          error={null}
          onRetry={vi.fn()}
        />
      );

      // For each category, verify its name appears in the document
      categories.forEach((category) => {
        expect(screen.getByText(category.name)).toBeInTheDocument();
      });

      // Verify the count matches
      const categoryNames = categories.map(c => c.name);
      categoryNames.forEach((name) => {
        const elements = screen.getAllByText(name);
        // Each category name should appear exactly once
        expect(elements).toHaveLength(1);
      });

      unmount();
    }
  );

  test.prop([
    fc.array(
      fc.record({
        id: fc.uuid(),
        name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        createdAt: fc.date().map(d => d.toISOString()),
        updatedAt: fc.constantFrom(null, fc.date().map(d => d.toISOString())),
      }),
      { minLength: 1, maxLength: 10 }
    ),
  ])(
    'should render the same number of cards as items in the categories array',
    (categories) => {
      const { container, unmount } = render(
        <ExploreCategories
          categories={categories}
          loading={false}
          error={null}
          onRetry={vi.fn()}
        />
      );

      // Count the number of category cards rendered
      const cards = container.querySelectorAll('[role="button"]');
      expect(cards).toHaveLength(categories.length);

      unmount();
    }
  );
});

// Feature: home-page-implementation, Property 13: Responsive Grid Column Count
// **Validates: Requirements 10.2, 10.3**
describe('ExploreCategories - Responsive Grid Property Tests', () => {
  test.prop([
    fc.array(
      fc.record({
        id: fc.uuid(),
        name: fc.string({ minLength: 1, maxLength: 50 }),
        createdAt: fc.date().map(d => d.toISOString()),
        updatedAt: fc.constantFrom(null, fc.date().map(d => d.toISOString())),
      }),
      { minLength: 1, maxLength: 10 }
    ),
  ])(
    'should apply responsive grid classes for all viewport sizes',
    (categories) => {
      const { container } = render(
        <ExploreCategories
          categories={categories}
          loading={false}
          error={null}
          onRetry={vi.fn()}
        />
      );

      // Find the grid container
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();

      // Verify responsive grid classes are applied
      // Mobile: grid-cols-1 (< 768px)
      expect(gridContainer).toHaveClass('grid-cols-1');
      
      // Tablet: md:grid-cols-2 (768px - 1023px)
      expect(gridContainer).toHaveClass('md:grid-cols-2');
      
      // Desktop: lg:grid-cols-3 (≥ 1024px)
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
    }
  );

  it('Property_13_ResponsiveGrid_ShouldHaveCorrectClasses_ForAllBreakpoints', () => {
    const testCategories: Category[] = [
      {
        id: '1',
        name: 'Test Category',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      },
    ];

    const { container } = render(
      <ExploreCategories
        categories={testCategories}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    const gridContainer = container.querySelector('.grid');
    
    // Verify all three responsive breakpoint classes are present
    const classes = gridContainer?.className || '';
    expect(classes).toContain('grid-cols-1'); // Mobile
    expect(classes).toContain('md:grid-cols-2'); // Tablet
    expect(classes).toContain('lg:grid-cols-3'); // Desktop
  });
});
