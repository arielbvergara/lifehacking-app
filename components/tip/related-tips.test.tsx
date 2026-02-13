import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RelatedTips } from './related-tips';
import { fetchTipsByCategory } from '@/lib/api/tips';
import type { PagedTipsResponse, TipSummary } from '@/lib/types/api';

// Mock the API client
vi.mock('@/lib/api/tips');
const mockFetchTipsByCategory = vi.mocked(fetchTipsByCategory);

// Mock the TipCard component
vi.mock('@/components/home/tip-card', () => ({
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
    const mockResponse: PagedTipsResponse = {
      items: [
        createMockTip('tip-1', 'Tip 1'),
        createMockTip('tip-2', 'Tip 2'),
      ],
      metadata: {
        totalItems: 2,
        pageNumber: 1,
        pageSize: 5,
        totalPages: 1,
      },
    };

    mockFetchTipsByCategory.mockResolvedValue(mockResponse);

    const component = await RelatedTips({
      categoryId: mockCategoryId,
      currentTipId: mockCurrentTipId,
      categoryName: mockCategoryName,
    });

    render(component as React.ReactElement);

    expect(mockFetchTipsByCategory).toHaveBeenCalledWith(mockCategoryId, {
      pageSize: 5,
      orderBy: 0, // TipSortField.CreatedAt
      sortDirection: 1, // SortDirection.Descending
    });
  });

  it('Should_FilterOutCurrentTip_When_CurrentTipInResults', async () => {
    const mockResponse: PagedTipsResponse = {
      items: [
        createMockTip(mockCurrentTipId, 'Current Tip'),
        createMockTip('tip-1', 'Tip 1'),
        createMockTip('tip-2', 'Tip 2'),
      ],
      metadata: {
        totalItems: 3,
        pageNumber: 1,
        pageSize: 5,
        totalPages: 1,
      },
    };

    mockFetchTipsByCategory.mockResolvedValue(mockResponse);

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
    const mockResponse: PagedTipsResponse = {
      items: [
        createMockTip('tip-1', 'Tip 1'),
        createMockTip('tip-2', 'Tip 2'),
        createMockTip('tip-3', 'Tip 3'),
        createMockTip('tip-4', 'Tip 4'),
        createMockTip('tip-5', 'Tip 5'),
      ],
      metadata: {
        totalItems: 5,
        pageNumber: 1,
        pageSize: 5,
        totalPages: 1,
      },
    };

    mockFetchTipsByCategory.mockResolvedValue(mockResponse);

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
    expect(screen.queryByTestId('tip-card-tip-5')).not.toBeInTheDocument();
  });

  it('Should_ReturnNull_When_NoRelatedTipsAfterFiltering', async () => {
    const mockResponse: PagedTipsResponse = {
      items: [createMockTip(mockCurrentTipId, 'Current Tip')],
      metadata: {
        totalItems: 1,
        pageNumber: 1,
        pageSize: 5,
        totalPages: 1,
      },
    };

    mockFetchTipsByCategory.mockResolvedValue(mockResponse);

    const component = await RelatedTips({
      categoryId: mockCategoryId,
      currentTipId: mockCurrentTipId,
      categoryName: mockCategoryName,
    });

    expect(component).toBeNull();
  });

  it('Should_ReturnNull_When_NoTipsInCategory', async () => {
    const mockResponse: PagedTipsResponse = {
      items: [],
      metadata: {
        totalItems: 0,
        pageNumber: 1,
        pageSize: 5,
        totalPages: 0,
      },
    };

    mockFetchTipsByCategory.mockResolvedValue(mockResponse);

    const component = await RelatedTips({
      categoryId: mockCategoryId,
      currentTipId: mockCurrentTipId,
      categoryName: mockCategoryName,
    });

    expect(component).toBeNull();
  });

  it('Should_RenderSectionHeading_When_RelatedTipsExist', async () => {
    const mockResponse: PagedTipsResponse = {
      items: [
        createMockTip('tip-1', 'Tip 1'),
        createMockTip('tip-2', 'Tip 2'),
      ],
      metadata: {
        totalItems: 2,
        pageNumber: 1,
        pageSize: 5,
        totalPages: 1,
      },
    };

    mockFetchTipsByCategory.mockResolvedValue(mockResponse);

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
    const mockResponse: PagedTipsResponse = {
      items: [
        createMockTip('tip-1', 'Tip 1'),
        createMockTip('tip-2', 'Tip 2'),
      ],
      metadata: {
        totalItems: 2,
        pageNumber: 1,
        pageSize: 5,
        totalPages: 1,
      },
    };

    mockFetchTipsByCategory.mockResolvedValue(mockResponse);

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
    mockFetchTipsByCategory.mockRejectedValue(new Error('API Error'));

    const component = await RelatedTips({
      categoryId: mockCategoryId,
      currentTipId: mockCurrentTipId,
    });

    expect(component).toBeNull();
  });

  it('Should_RenderAriaLabel_When_RelatedTipsExist', async () => {
    const mockResponse: PagedTipsResponse = {
      items: [createMockTip('tip-1', 'Tip 1')],
      metadata: {
        totalItems: 1,
        pageNumber: 1,
        pageSize: 5,
        totalPages: 1,
      },
    };

    mockFetchTipsByCategory.mockResolvedValue(mockResponse);

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
