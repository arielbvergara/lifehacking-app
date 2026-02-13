import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TipCard } from './tip-card';
import { TipSummary } from '@/lib/types/api';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

describe('TipCard', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  const mockTip: TipSummary = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'How to Clean Your Kitchen Faster',
    description: 'Learn the best techniques for cleaning your kitchen in half the time with these simple tricks.',
    categoryId: 'cat-123',
    categoryName: 'Kitchen',
    tags: ['cleaning', 'kitchen'],
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

  it('should render tip title', () => {
    render(<TipCard tip={mockTip} />);
    expect(screen.getByText('How to Clean Your Kitchen Faster')).toBeInTheDocument();
  });

  it('should render tip description', () => {
    render(<TipCard tip={mockTip} />);
    expect(screen.getByText(/Learn the best techniques for cleaning your kitchen/)).toBeInTheDocument();
  });

  it('should render category badge overlaid on image', () => {
    render(<TipCard tip={mockTip} />);
    const badge = screen.getByText('Kitchen');
    expect(badge).toBeInTheDocument();
    
    // Badge should be in a container with absolute positioning
    const badgeContainer = badge.closest('div');
    expect(badgeContainer).toHaveClass('absolute');
  });

  it('should render tip image when image is provided', () => {
    render(<TipCard tip={mockTip} />);
    const image = screen.getByAltText('How to Clean Your Kitchen Faster');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('should render placeholder icon when image is null', () => {
    const tipWithoutImage: TipSummary = {
      ...mockTip,
      image: undefined,
    };
    render(<TipCard tip={tipWithoutImage} />);
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  it('should truncate long title', () => {
    const longTitle = 'A'.repeat(100);
    const tipWithLongTitle: TipSummary = {
      ...mockTip,
      title: longTitle,
    };
    render(<TipCard tip={tipWithLongTitle} />);
    
    const titleElement = screen.getByText(/A+\.\.\./);
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.textContent).toContain('...');
  });

  it('should truncate long description', () => {
    const longDescription = 'B'.repeat(200);
    const tipWithLongDescription: TipSummary = {
      ...mockTip,
      description: longDescription,
    };
    render(<TipCard tip={tipWithLongDescription} />);
    
    const descriptionElement = screen.getByText(/B+\.\.\./);
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement.textContent).toContain('...');
  });

  it('should render "Read tip >" link', () => {
    render(<TipCard tip={mockTip} />);
    expect(screen.getByText('Read tip >')).toBeInTheDocument();
  });

  it('should navigate to tip detail page when "Read tip >" is clicked', async () => {
    const user = userEvent.setup();
    render(<TipCard tip={mockTip} />);
    
    const readButton = screen.getByText('Read tip >');
    await user.click(readButton);
    
    expect(mockPush).toHaveBeenCalledWith('/tip/123e4567-e89b-12d3-a456-426614174000');
  });

  it('should render heart icon for favorites', () => {
    render(<TipCard tip={mockTip} />);
    const favoriteButton = screen.getByLabelText('Add to favorites');
    expect(favoriteButton).toBeInTheDocument();
  });

  it('should not navigate when heart icon is clicked', async () => {
    const user = userEvent.setup();
    render(<TipCard tip={mockTip} />);
    
    const favoriteButton = screen.getByLabelText('Add to favorites');
    await user.click(favoriteButton);
    
    // Heart icon should not trigger navigation
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should have hover styles applied', () => {
    const { container } = render(<TipCard tip={mockTip} />);
    const card = container.firstChild as HTMLElement;
    
    expect(card).toHaveClass('hover:shadow-md');
  });

  it('should display all non-null fields from tip object', () => {
    render(<TipCard tip={mockTip} />);
    
    // Verify all non-null fields are displayed
    expect(screen.getByText('How to Clean Your Kitchen Faster')).toBeInTheDocument();
    expect(screen.getByText(/Learn the best techniques/)).toBeInTheDocument();
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
    expect(screen.getByAltText('How to Clean Your Kitchen Faster')).toBeInTheDocument();
  });
});

// Property-Based Tests
import { fc, test } from '@fast-check/vitest';
import { cleanup } from '@testing-library/react';

// Feature: home-page-implementation, Property 6: Navigation ID Preservation
// **Validates: Requirements 5.11, 11.2**
describe('TipCard - Property Tests', () => {
  test.prop([
    fc.uuid(),
    fc.string({ minLength: 1, maxLength: 100 }),
    fc.string({ minLength: 1, maxLength: 200 }),
    fc.string({ minLength: 1, maxLength: 50 }),
  ])(
    'should preserve exact tip ID in navigation URL',
    async (tipId, title, description, categoryName) => {
      // Clean up any previous renders
      cleanup();
      mockPush.mockClear();
      
      const tip: TipSummary = {
        id: tipId,
        title,
        description,
        categoryId: 'cat-123',
        categoryName,
        tags: [],
        videoUrl: null,
        createdAt: '2024-01-01T00:00:00Z',
        image: undefined,
      };

      const user = userEvent.setup();
      const { container } = render(<TipCard tip={tip} />);
      
      // Find the "Read tip >" button
      const readButton = container.querySelector('button') as HTMLElement;
      await user.click(readButton);
      
      // Verify the exact ID is preserved in the navigation URL
      expect(mockPush).toHaveBeenCalledWith(`/tip/${tipId}`);
      expect(mockPush).toHaveBeenCalledTimes(1);
    }
  );
});

  // Feature: home-page-implementation, Property 3: Data Display Integrity
  // **Validates: Requirements 5.5, 5.6, 5.8**
  test.prop([
    fc.uuid(),
    fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    fc.oneof(
      fc.constant(undefined),
      fc.record({
        imageUrl: fc.webUrl(),
        imageStoragePath: fc.string(),
        originalFileName: fc.string(),
        contentType: fc.constant('image/jpeg'),
        fileSizeBytes: fc.integer({ min: 1, max: 5000000 }),
        uploadedAt: fc.constant('2024-01-01T00:00:00Z'),
      })
    ),
  ])(
    'should display all non-null fields from tip object',
    (tipId, title, description, categoryName, image) => {
      cleanup();
      
      const tip: TipSummary = {
        id: tipId,
        title,
        description,
        categoryId: 'cat-123',
        categoryName,
        tags: [],
        videoUrl: null,
        createdAt: '2024-01-01T00:00:00Z',
        image,
      };

      const { container } = render(<TipCard tip={tip} />);
      
      // Verify title is displayed (may be truncated)
      // Check for a substring to handle truncation
      const titleSubstring = title.trim().substring(0, Math.min(10, title.trim().length));
      expect(container.textContent).toContain(titleSubstring);
      
      // Verify description is displayed (may be truncated)
      const descSubstring = description.trim().substring(0, Math.min(10, description.trim().length));
      expect(container.textContent).toContain(descSubstring);
      
      // Verify category name is displayed
      const categorySubstring = categoryName.trim().substring(0, Math.min(10, categoryName.trim().length));
      expect(container.textContent).toContain(categorySubstring);
      
      // Verify image or placeholder is displayed
      if (image?.imageUrl) {
        // Use getByRole to find the image more reliably
        const images = container.querySelectorAll('img');
        const tipImage = Array.from(images).find(img => img.getAttribute('alt') === title);
        expect(tipImage).toBeDefined();
        expect(tipImage?.getAttribute('src')).toBe(image.imageUrl);
      } else {
        expect(screen.getByText('📝')).toBeInTheDocument();
      }
    }
  );
