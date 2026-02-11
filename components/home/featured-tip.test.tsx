import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FeaturedTip } from './featured-tip';
import { TipSummary } from '@/lib/types/api';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockTip: TipSummary = {
  id: 'tip-123',
  title: 'Amazing Kitchen Hack',
  description: 'This is a great tip for making your kitchen life easier and more efficient.',
  categoryId: 'cat-1',
  categoryName: 'Kitchen',
  tags: ['cooking', 'efficiency'],
  videoUrl: 'https://example.com/image.jpg',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('FeaturedTip', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('should display loading state with skeleton', () => {
    render(
      <FeaturedTip tip={null} loading={true} error={null} onRetry={vi.fn()} />
    );

    // Check for skeleton animation
    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('should display error state with retry button', () => {
    const errorMessage = 'Failed to load featured tip';
    const handleRetry = vi.fn();

    render(
      <FeaturedTip
        tip={null}
        loading={false}
        error={errorMessage}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();

    render(
      <FeaturedTip
        tip={null}
        loading={false}
        error="Error occurred"
        onRetry={handleRetry}
      />
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should render tip with LIFEHACK badge', () => {
    render(
      <FeaturedTip tip={mockTip} loading={false} error={null} onRetry={vi.fn()} />
    );

    expect(screen.getByText('LIFEHACK')).toBeInTheDocument();
  });

  it('should render tip title', () => {
    render(
      <FeaturedTip tip={mockTip} loading={false} error={null} onRetry={vi.fn()} />
    );

    expect(screen.getByText(mockTip.title)).toBeInTheDocument();
  });

  it('should render tip description', () => {
    render(
      <FeaturedTip tip={mockTip} loading={false} error={null} onRetry={vi.fn()} />
    );

    expect(screen.getByText(mockTip.description)).toBeInTheDocument();
  });

  it('should truncate long descriptions', () => {
    const longTip: TipSummary = {
      ...mockTip,
      description: 'A'.repeat(250), // Longer than 200 character limit
    };

    render(
      <FeaturedTip tip={longTip} loading={false} error={null} onRetry={vi.fn()} />
    );

    const displayedText = screen.getByText(/A+\.\.\./);
    expect(displayedText).toBeInTheDocument();
    expect(displayedText.textContent).toContain('...');
  });

  it('should render Read More button', () => {
    render(
      <FeaturedTip tip={mockTip} loading={false} error={null} onRetry={vi.fn()} />
    );

    expect(screen.getByRole('button', { name: /read more/i })).toBeInTheDocument();
  });

  it('should render Save button', () => {
    render(
      <FeaturedTip tip={mockTip} loading={false} error={null} onRetry={vi.fn()} />
    );

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should navigate to tip detail page when Read More is clicked', async () => {
    const user = userEvent.setup();

    render(
      <FeaturedTip tip={mockTip} loading={false} error={null} onRetry={vi.fn()} />
    );

    const readMoreButton = screen.getByRole('button', { name: /read more/i });
    await user.click(readMoreButton);

    expect(mockPush).toHaveBeenCalledWith(`/tip/${mockTip.id}`);
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('should not navigate when Save button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <FeaturedTip tip={mockTip} loading={false} error={null} onRetry={vi.fn()} />
    );

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Save button should not trigger navigation
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should render tip image when videoUrl is provided', () => {
    render(
      <FeaturedTip tip={mockTip} loading={false} error={null} onRetry={vi.fn()} />
    );

    const image = screen.getByRole('img', { name: mockTip.title });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockTip.videoUrl);
  });

  it('should not render image section when videoUrl is null', () => {
    const tipWithoutImage: TipSummary = {
      ...mockTip,
      videoUrl: null,
    };

    render(
      <FeaturedTip
        tip={tipWithoutImage}
        loading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    const image = screen.queryByRole('img');
    expect(image).not.toBeInTheDocument();
  });

  it('should return null when tip is null and not loading or error', () => {
    const { container } = render(
      <FeaturedTip tip={null} loading={false} error={null} onRetry={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render as a section element', () => {
    const { container } = render(
      <FeaturedTip tip={mockTip} loading={false} error={null} onRetry={vi.fn()} />
    );

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });
});

// Property-Based Tests
import { fc, test } from '@fast-check/vitest';
import { cleanup } from '@testing-library/react';

// Feature: home-page-implementation, Property 6: Navigation ID Preservation
// **Validates: Requirements 4.10, 11.3**
describe('FeaturedTip - Property Tests', () => {
  test.prop([
    fc.uuid(),
    fc.string({ minLength: 1, maxLength: 100 }),
    fc.string({ minLength: 1, maxLength: 500 }),
  ])(
    'should preserve exact tip ID in navigation URL when Read More is clicked',
    async (tipId, title, description) => {
      cleanup();
      mockPush.mockClear();

      const tip: TipSummary = {
        id: tipId,
        title,
        description,
        categoryId: 'cat-1',
        categoryName: 'Test Category',
        tags: ['test'],
        videoUrl: 'https://example.com/image.jpg',
        createdAt: '2024-01-01T00:00:00Z',
      };

      const user = userEvent.setup();
      const { container } = render(
        <FeaturedTip tip={tip} loading={false} error={null} onRetry={vi.fn()} />
      );

      const readMoreButton = container.querySelector(
        'button'
      ) as HTMLButtonElement;
      await user.click(readMoreButton);

      // Verify the exact ID is preserved in the navigation URL
      expect(mockPush).toHaveBeenCalledWith(`/tip/${tipId}`);
      expect(mockPush).toHaveBeenCalledTimes(1);
    }
  );
});
