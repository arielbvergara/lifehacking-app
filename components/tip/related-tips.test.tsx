import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RelatedTips } from './related-tips';
import { getCachedRelatedTips } from '@/lib/data/tip-data';
import type { TipSummary } from '@/lib/types/api';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the cached data function
vi.mock('@/lib/data/tip-data');
const mockGetCachedRelatedTips = vi.mocked(getCachedRelatedTips);

// Mock the TipCard component
vi.mock('@/components/shared/tip/tip-card', () => ({
  TipCard: ({ tip }: { tip: TipSummary }) => (
    <div data-testid={`tip-card-${tip.id}`}>{tip.title}</div>
  ),
}));

describe('RelatedTips', () => {
  const mockCategoryId = 'category-123';
  const mockCurrentTipId = 'current-tip-456';
  const mockCategoryName = 'Kitchen Hacks';

  const createMockTip = (id: string, title: string): TipSummary => ({
    id,
    title,
    description: 'Test description',
    categoryId: mockCategoryId,
    categoryName: mockCategoryName,
    tags: ['test'],
    videoUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should_FetchRelatedTips_When_ComponentRenders', async () => {
    const mockTips = [
      createMockTip('tip-1', 'Tip 1'),
      createMockTip('tip-2', 'Tip 2'),
    ];

    mockGetCachedRelatedTips.mockResolvedValue(mockTips);

    const component = await RelatedTips({
      categoryId: mockCategoryId,
      currentTipId: mockCurrentTipId,
      categoryName: mockCategoryName,
    });

    render(component as React.ReactElement);

    expect(mockGetCachedRelatedTips).toHaveBeenCalledWith(
      mockCategoryId,
      mockCurrentTipId
    );
  });

  it('Should_FilterOutCurrentTip_When_CurrentTipInResults', async () => {
    // The cached function already filters out the current tip
    const mockTips = [
      createMockTip('tip-1', 'Tip 1'),
      createMockTip('tip-2', 'Tip 2'),
    ];

    mockGetCachedRelatedTips.mockResolvedValue(mockTips);

    const component = await RelatedTips({
      categoryId: mockCategoryId,
      currentTipId: mockCurrentTipId,
      categoryName: mockCategoryName,
    });

    render(component as React.ReactElement);

    expect(screen.queryByTestId(`tip-card-${mockCurrentTipId}`)).not.toBeInTheDocument();
    expect(screen.getByTestId('tip-card-tip-1')).toBeInTheDocument();
    expect(screen.getByTestId('tip-card-tip-2')).toBeInTheDocument();
  });

  it('Should_LimitToFourTips_When_MoreThanFourAvailable', async () => {
    // The cached function already limits to 4 tips
    const mockTips = [
      createMockTip('tip-1', 'Tip 1'),
      createMockTip('tip-2', 'Tip 2'),
      createMockTip('tip-3', 'Tip 3'),
      createMockTip('tip-4', 'Tip 4'),
    ];

    mockGetCachedRelatedTips.mockResolvedValue(mockTips);

    const component = await RelatedTips({
      categoryId: mockCategoryId,
      currentTipId: mockCurrentTipId,
      categoryName: mockCategoryName,
    });

    render(component as React.ReactElement);

    expect(screen.getByTestId('tip-card-tip-1')).toBeInTheDocument();
    expect(screen.getByTestId('tip-card-tip-2')).toBeInTheDocument();
    expect(screen.getByTestId('tip-card-tip-3')).toBeInTheDocument();
    expect(screen.getByTestId('tip-card-tip-4')).toBeInTheDocument();
  });

  it('Should_ReturnNull_When_NoRelatedTipsAfterFiltering', async () => {
    mockGetCachedRelatedTips.mockResolvedValue([]);

    const component = await RelatedTips({
      categoryId: mockCategoryId,
      currentTipId: mockCurrentTipId,
      categoryName: mockCategoryName,
    });

    expect(component).toBeNull();
  });

  it('Should_ReturnNull_When_NoTipsInCategory', async () => {
    mockGetCachedRelatedTips.mockResolvedValue([]);

    const component = await RelatedTips({
      categoryId: mockCategoryId,
      currentTipId: mockCurrentTipId,
      categoryName: mockCategoryName,
    });

    expect(component).toBeNull();
  });

  it('Should_RenderSectionHeading_When_RelatedTipsExist', async () => {
    const mockTips = [
      createMockTip('tip-1', 'Tip 1'),
      createMockTip('tip-2', 'Tip 2'),
    ];

    mockGetCachedRelatedTips.mockResolvedValue(mockTips);

    const component = await RelatedTips({
      categoryId: mockCategoryId,
      currentTipId: mockCurrentTipId,
      categoryName: mockCategoryName,
    });

    render(component as React.ReactElement);

    expect(screen.getByText('More like this')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'More like this' })).toBeInTheDocument();
  });

  it('Should_RenderResponsiveGrid_When_RelatedTipsExist', async () => {
    const mockTips = [
      createMockTip('tip-1', 'Tip 1'),
      createMockTip('tip-2', 'Tip 2'),
    ];

    mockGetCachedRelatedTips.mockResolvedValue(mockTips);

    const component = await RelatedTips({
      categoryId: mockCategoryId,
      currentTipId: mockCurrentTipId,
      categoryName: mockCategoryName,
    });

    const { container } = render(component as React.ReactElement);

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('Should_ReturnNull_When_APIFails', async () => {
    // The cached function returns empty array on error
    mockGetCachedRelatedTips.mockResolvedValue([]);

    const component = await RelatedTips({
      categoryId: mockCategoryId,
      currentTipId: mockCurrentTipId,
    });

    expect(component).toBeNull();
  });

  it('Should_RenderAriaLabel_When_RelatedTipsExist', async () => {
    const mockTips = [createMockTip('tip-1', 'Tip 1')];

    mockGetCachedRelatedTips.mockResolvedValue(mockTips);

    const component = await RelatedTips({
      categoryId: mockCategoryId,
      currentTipId: mockCurrentTipId,
      categoryName: mockCategoryName,
    });

    render(component as React.ReactElement);

    const section = screen.getByRole('region', {
      name: 'Related tips from the same category',
    });
    expect(section).toBeInTheDocument();
  });
});
