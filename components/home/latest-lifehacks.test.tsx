import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { LatestLifehacks } from './latest-lifehacks';
import { TipSummary } from '@/lib/types/api';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockTips: TipSummary[] = [
  {
    id: 'tip-1',
    title: 'Kitchen Hack 1',
    description: 'A great kitchen tip',
    categoryId: 'cat-1',
    categoryName: 'Kitchen',
    tags: ['cooking'],
    videoUrl: 'https://example.com/image1.jpg',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tip-2',
    title: 'Cleaning Hack 2',
    description: 'A useful cleaning tip',
    categoryId: 'cat-2',
    categoryName: 'Cleaning',
    tags: ['cleaning'],
    videoUrl: 'https://example.com/image2.jpg',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'tip-3',
    title: 'Tech Hack 3',
    description: 'A helpful tech tip',
    categoryId: 'cat-3',
    categoryName: 'Tech Help',
    tags: ['technology'],
    videoUrl: 'https://example.com/image3.jpg',
    createdAt: '2024-01-03T00:00:00Z',
  },
];

describe('LatestLifehacks', () => {
  it('should render section title', () => {
    render(
      <LatestLifehacks
        tips={mockTips}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('Latest Lifehacks')).toBeInTheDocument();
  });

  it('should display loading state with skeleton cards', () => {
    render(
      <LatestLifehacks tips={[]} loading={true} error={null} onRetry={vi.fn()} />
    );

    // Should show skeleton loaders (6 by default)
    const skeletons = screen.getAllByRole('generic').filter((el) =>
      el.className.includes('animate-pulse')
    );
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display error state with retry button', () => {
    const errorMessage = 'Failed to load tips';
    render(
      <LatestLifehacks
        tips={[]}
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
      <LatestLifehacks
        tips={[]}
        loading={false}
        error="Failed to load"
        onRetry={handleRetry}
      />
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should display tip cards when data is loaded', () => {
    render(
      <LatestLifehacks
        tips={mockTips}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('Kitchen Hack 1')).toBeInTheDocument();
    expect(screen.getByText('Cleaning Hack 2')).toBeInTheDocument();
    expect(screen.getByText('Tech Hack 3')).toBeInTheDocument();
  });

  it('should not display loading state when data is present', () => {
    render(
      <LatestLifehacks
        tips={mockTips}
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
      <LatestLifehacks
        tips={mockTips}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();
  });

  it('should display empty state when tips array is empty', () => {
    render(
      <LatestLifehacks tips={[]} loading={false} error={null} onRetry={vi.fn()} />
    );

    expect(screen.getByText('No tips available yet.')).toBeInTheDocument();
  });

  it('should render grid with correct number of tip cards', () => {
    const { container } = render(
      <LatestLifehacks
        tips={mockTips}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    // Each TipCard has a "Read tip >" button
    const readTipButtons = screen.getAllByText(/read tip/i);
    expect(readTipButtons).toHaveLength(mockTips.length);
  });

  it('should render as a section element', () => {
    const { container } = render(
      <LatestLifehacks
        tips={mockTips}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('should display category badges for each tip', () => {
    render(
      <LatestLifehacks
        tips={mockTips}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('Kitchen')).toBeInTheDocument();
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Tech Help')).toBeInTheDocument();
  });
});

// Property-Based Tests
import { fc, test } from '@fast-check/vitest';

// Feature: home-page-implementation, Property 2: List Rendering Completeness
// **Validates: Requirements 5.3**
describe('LatestLifehacks - Property Tests', () => {
  test.prop([
    fc.array(
      fc.record({
        id: fc.uuid(),
        title: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5 && /^[a-zA-Z0-9\s]+$/.test(s)),
        description: fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length >= 10),
        categoryId: fc.uuid(),
        categoryName: fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9\s]+$/.test(s)),
        tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 0,
          maxLength: 5,
        }),
        videoUrl: fc.constantFrom(
          null,
          fc.webUrl().map((url) => url)
        ),
        createdAt: fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() }).map((timestamp) => new Date(timestamp).toISOString()),
      }),
      { minLength: 1, maxLength: 20 }
    ),
  ])(
    'should render exactly one TipCard for each tip in the list',
    (tips) => {
      const { unmount } = render(
        <LatestLifehacks
          tips={tips}
          loading={false}
          error={null}
          onRetry={vi.fn()}
        />
      );

      // Verify the count matches by checking "Read tip >" buttons (one per card)
      const readTipButtons = screen.getAllByText(/read tip/i);
      expect(readTipButtons).toHaveLength(tips.length);

      unmount();
    }
  );

  test.prop([
    fc.array(
      fc.record({
        id: fc.uuid(),
        title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
        categoryId: fc.uuid(),
        categoryName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 0,
          maxLength: 5,
        }),
        videoUrl: fc.constantFrom(
          null,
          fc.webUrl().map((url) => url)
        ),
        createdAt: fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() }).map((timestamp) => new Date(timestamp).toISOString()),
      }),
      { minLength: 1, maxLength: 10 }
    ),
  ])(
    'should render the same number of cards as items in the tips array',
    (tips) => {
      const { unmount } = render(
        <LatestLifehacks
          tips={tips}
          loading={false}
          error={null}
          onRetry={vi.fn()}
        />
      );

      // Count the number of "Read tip >" buttons (one per card)
      const readTipButtons = screen.getAllByText(/read tip/i);
      expect(readTipButtons).toHaveLength(tips.length);

      unmount();
    }
  );
});

// Feature: home-page-implementation, Property 13: Responsive Grid Column Count
// **Validates: Requirements 10.4, 10.5**
describe('LatestLifehacks - Responsive Grid Property Tests', () => {
  test.prop([
    fc.array(
      fc.record({
        id: fc.uuid(),
        title: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string({ minLength: 1, maxLength: 500 }),
        categoryId: fc.uuid(),
        categoryName: fc.string({ minLength: 1, maxLength: 50 }),
        tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 0,
          maxLength: 5,
        }),
        videoUrl: fc.constantFrom(
          null,
          fc.webUrl().map((url) => url)
        ),
        createdAt: fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() }).map((timestamp) => new Date(timestamp).toISOString()),
      }),
      { minLength: 1, maxLength: 10 }
    ),
  ])(
    'should apply responsive grid classes for all viewport sizes',
    (tips) => {
      const { container } = render(
        <LatestLifehacks
          tips={tips}
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
    const testTips: TipSummary[] = [
      {
        id: '1',
        title: 'Test Tip',
        description: 'Test description',
        categoryId: 'cat-1',
        categoryName: 'Test Category',
        tags: ['test'],
        videoUrl: 'https://example.com/image.jpg',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    const { container } = render(
      <LatestLifehacks
        tips={testTips}
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
