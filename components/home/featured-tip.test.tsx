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
  videoUrl: 'https://example.com/video.mp4',
  createdAt: '2024-01-01T00:00:00Z',
  image: {
    imageUrl: 'https://example.com/image.jpg',
    imageStoragePath: 'tips/image.jpg',
    originalFileName: 'image.jpg',
    contentType: 'image/jpeg',
    fileSizeBytes: 1024,
    uploadedAt: '2024-01-01T00:00:00Z',
  },
};

describe('FeaturedTip', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('should render tip with TIP OF THE DAY badge', () => {
    render(<FeaturedTip tip={mockTip} />);

    expect(screen.getByText('TIP OF THE DAY')).toBeInTheDocument();
  });

  it('should render tip title', () => {
    render(<FeaturedTip tip={mockTip} />);

    expect(screen.getByText(mockTip.title)).toBeInTheDocument();
  });

  it('should render tip description', () => {
    render(<FeaturedTip tip={mockTip} />);

    expect(screen.getByText(mockTip.description)).toBeInTheDocument();
  });

  it('should truncate long descriptions', () => {
    const longTip: TipSummary = {
      ...mockTip,
      description: 'A'.repeat(250), // Longer than 200 character limit
    };

    render(<FeaturedTip tip={longTip} />);

    const displayedText = screen.getByText(/A+\.\.\./);
    expect(displayedText).toBeInTheDocument();
    expect(displayedText.textContent).toContain('...');
  });

  it('should render Watch Video button', () => {
    render(<FeaturedTip tip={mockTip} />);

    expect(screen.getByRole('button', { name: /watch video/i })).toBeInTheDocument();
  });

  it('should render Read Guide button', () => {
    render(<FeaturedTip tip={mockTip} />);

    expect(screen.getByRole('button', { name: /read guide/i })).toBeInTheDocument();
  });

  it('should navigate to tip detail page when Watch Video is clicked', async () => {
    const user = userEvent.setup();

    render(<FeaturedTip tip={mockTip} />);

    const watchVideoButton = screen.getByRole('button', { name: /watch video/i });
    await user.click(watchVideoButton);

    expect(mockPush).toHaveBeenCalledWith(`/tip/${mockTip.id}`);
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('should not navigate when Read Guide button is clicked', async () => {
    const user = userEvent.setup();

    render(<FeaturedTip tip={mockTip} />);

    const readGuideButton = screen.getByRole('button', { name: /read guide/i });
    await user.click(readGuideButton);

    // Read Guide button should not trigger navigation
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should render tip image when image is provided', () => {
    render(<FeaturedTip tip={mockTip} />);

    const image = screen.getByRole('img', { name: `${mockTip.title} - ${mockTip.categoryName} life hack with step-by-step guide` });
    expect(image).toBeInTheDocument();
    // Next.js Image component transforms the src URL, so check it contains the original URL
    expect(image.getAttribute('src')).toContain(encodeURIComponent(mockTip.image?.imageUrl || ''));
  });

  it('should not render image section when image is not provided', () => {
    const tipWithoutImage: TipSummary = {
      ...mockTip,
      image: undefined,
    };

    render(<FeaturedTip tip={tipWithoutImage} />);

    const image = screen.queryByRole('img');
    expect(image).not.toBeInTheDocument();
  });

  it('should render as a section element', () => {
    const { container } = render(<FeaturedTip tip={mockTip} />);

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
        videoUrl: null,
        createdAt: '2024-01-01T00:00:00Z',
        image: {
          imageUrl: 'https://example.com/image.jpg',
          imageStoragePath: 'tips/image.jpg',
          originalFileName: 'image.jpg',
          contentType: 'image/jpeg',
          fileSizeBytes: 1024,
          uploadedAt: '2024-01-01T00:00:00Z',
        },
      };

      const user = userEvent.setup();
      const { container } = render(<FeaturedTip tip={tip} />);

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
