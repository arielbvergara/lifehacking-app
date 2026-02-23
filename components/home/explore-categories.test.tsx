import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    render(<ExploreCategories categories={mockCategories} />);

    expect(screen.getByText('Explore Categories')).toBeInTheDocument();
    expect(
      screen.getByText('Find simple tricks for every area of your life')
    ).toBeInTheDocument();
  });

  it('should render "View all" link', () => {
    render(<ExploreCategories categories={mockCategories} />);

    const viewAllLink = screen.getByText(/view all/i);
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink).toHaveAttribute('href', '/categories');
  });

  it('should display category cards when data is loaded', () => {
    render(<ExploreCategories categories={mockCategories} />);

    expect(screen.getByText('Kitchen')).toBeInTheDocument();
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Tech Help')).toBeInTheDocument();
  });

  it('should render empty grid when categories array is empty', () => {
    render(<ExploreCategories categories={[]} />);

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
        name: fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9\s]+$/.test(s)),
        createdAt: fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() }).map((timestamp) => new Date(timestamp).toISOString()),
        updatedAt: fc.option(fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() }).map((timestamp) => new Date(timestamp).toISOString()), { nil: null }),
      }),
      { minLength: 1, maxLength: 20 }
    ),
  ], { numRuns: 10 })(
    'should render exactly one CategoryCard for each category in the list',
    (categories) => {
      const { container, unmount } = render(
        <ExploreCategories categories={categories} />
      );

      // Count the number of category cards rendered (using role="button" which is unique to cards)
      const cards = container.querySelectorAll('[role="button"]');
      expect(cards).toHaveLength(categories.length);

      unmount();
    }
  );

  test.prop([
    fc.array(
      fc.record({
        id: fc.uuid(),
        name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        createdAt: fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() }).map((timestamp) => new Date(timestamp).toISOString()),
        updatedAt: fc.option(fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() }).map((timestamp) => new Date(timestamp).toISOString()), { nil: null }),
      }),
      { minLength: 1, maxLength: 10 }
    ),
  ], { numRuns: 10 })(
    'should render the same number of cards as items in the categories array',
    (categories) => {
      const { container, unmount } = render(
        <ExploreCategories categories={categories} />
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
        createdAt: fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() }).map((timestamp) => new Date(timestamp).toISOString()),
        updatedAt: fc.option(fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() }).map((timestamp) => new Date(timestamp).toISOString()), { nil: null }),
      }),
      { minLength: 1, maxLength: 10 }
    ),
  ], { numRuns: 10 })(
    'should apply responsive grid classes for all viewport sizes',
    (categories) => {
      const { container } = render(
        <ExploreCategories categories={categories} />
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
      <ExploreCategories categories={testCategories} />
    );

    const gridContainer = container.querySelector('.grid');
    
    // Verify all three responsive breakpoint classes are present
    const classes = gridContainer?.className || '';
    expect(classes).toContain('grid-cols-1'); // Mobile
    expect(classes).toContain('md:grid-cols-2'); // Tablet
    expect(classes).toContain('lg:grid-cols-3'); // Desktop
  });
});
