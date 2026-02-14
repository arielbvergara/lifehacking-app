import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryCard } from '../../home/category-card';
import { Category } from '@/lib/types/api';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('CategoryCard', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  const mockCategory: Category = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Kitchen',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
  };

  const mockCategoryWithImage: Category = {
    ...mockCategory,
    image: {
      imageUrl: 'https://example.com/kitchen.jpg',
      imageStoragePath: '/images/kitchen.jpg',
      originalFileName: 'kitchen.jpg',
      contentType: 'image/jpeg',
      fileSizeBytes: 1024,
      uploadedAt: '2024-01-01T00:00:00Z',
    },
  };

  it('should render category name', () => {
    render(<CategoryCard category={mockCategory} />);
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
  });

  it('should render tip count with default value of 0', () => {
    render(<CategoryCard category={mockCategory} />);
    expect(screen.getByText('0 tips')).toBeInTheDocument();
  });

  it('should render tip count when provided', () => {
    render(<CategoryCard category={mockCategory} tipCount={42} />);
    expect(screen.getByText('42 tips')).toBeInTheDocument();
  });

  it('should render category icon', () => {
    render(<CategoryCard category={mockCategory} />);
    // Kitchen category should have the 🍳 icon
    expect(screen.getByText('🍳')).toBeInTheDocument();
  });

  it('should navigate to category page on click', async () => {
    const user = userEvent.setup();
    render(<CategoryCard category={mockCategory} />);
    
    const card = screen.getByRole('button');
    await user.click(card);
    
    expect(mockPush).toHaveBeenCalledWith('/category/123e4567-e89b-12d3-a456-426614174000');
  });

  it('should navigate on Enter key press', async () => {
    const user = userEvent.setup();
    render(<CategoryCard category={mockCategory} />);
    
    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');
    
    expect(mockPush).toHaveBeenCalledWith('/category/123e4567-e89b-12d3-a456-426614174000');
  });

  it('should navigate on Space key press', async () => {
    const user = userEvent.setup();
    render(<CategoryCard category={mockCategory} />);
    
    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard(' ');
    
    expect(mockPush).toHaveBeenCalledWith('/category/123e4567-e89b-12d3-a456-426614174000');
  });

  it('should render default icon for unknown category', () => {
    const unknownCategory: Category = {
      ...mockCategory,
      name: 'Unknown Category',
    };
    render(<CategoryCard category={unknownCategory} />);
    
    // Should render default icon 📌
    expect(screen.getByText('📌')).toBeInTheDocument();
  });

  it('should have hover styles applied', () => {
    render(<CategoryCard category={mockCategory} />);
    const card = screen.getByRole('button');
    
    expect(card).toHaveClass('hover:shadow-md');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('should render image when imageUrl is provided', () => {
    render(<CategoryCard category={mockCategoryWithImage} />);
    
    const image = screen.getByAltText('Kitchen category - Browse life hacks and tips');
    expect(image).toBeInTheDocument();
    // Next.js Image component transforms the src URL, so check it contains the original URL
    expect(image.getAttribute('src')).toContain(encodeURIComponent('https://example.com/kitchen.jpg'));
  });

  it('should render white text when image is provided', () => {
    render(<CategoryCard category={mockCategoryWithImage} />);
    
    const heading = screen.getByText('Kitchen');
    expect(heading).toHaveClass('text-white');
  });

  it('should render dark overlay when image is provided', () => {
    const { container } = render(<CategoryCard category={mockCategoryWithImage} />);
    
    const overlay = container.querySelector('.bg-black.bg-opacity-40');
    expect(overlay).toBeInTheDocument();
  });

  it('should render icon when no image is provided', () => {
    render(<CategoryCard category={mockCategory} />);
    
    expect(screen.getByText('🍳')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should render icon when image object exists but imageUrl is null', () => {
    const categoryWithNullImage: Category = {
      ...mockCategory,
      image: {
        imageUrl: null,
        imageStoragePath: null,
        originalFileName: null,
        contentType: null,
        fileSizeBytes: 0,
        uploadedAt: '2024-01-01T00:00:00Z',
      },
    };
    
    render(<CategoryCard category={categoryWithNullImage} />);
    
    expect(screen.getByText('🍳')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

// Property-Based Tests
import { fc, test } from '@fast-check/vitest';
import { cleanup } from '@testing-library/react';

// Feature: home-page-implementation, Property 6: Navigation ID Preservation
// **Validates: Requirements 3.8, 11.1**
describe('CategoryCard - Property Tests', () => {
  test.prop([
    fc.uuid(),
    fc.string({ minLength: 1, maxLength: 50 }),
  ])(
    'should preserve exact category ID in navigation URL',
    async (categoryId, categoryName) => {
      // Clean up any previous renders
      cleanup();
      mockPush.mockClear();
      
      const category: Category = {
        id: categoryId,
        name: categoryName,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      };

      const user = userEvent.setup();
      const { container } = render(<CategoryCard category={category} />);
      
      // Use container to find the specific button for this render
      const card = container.querySelector('[role="button"]') as HTMLElement;
      await user.click(card);
      
      // Verify the exact ID is preserved in the navigation URL
      expect(mockPush).toHaveBeenCalledWith(`/category/${categoryId}`);
      expect(mockPush).toHaveBeenCalledTimes(1);
    }
  );
});
