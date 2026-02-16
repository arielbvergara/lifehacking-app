import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CategoryFilterBar } from './category-filter-bar';
import type { Category } from '@/lib/types/api';

// Mock API
const mockFetchCategories = vi.fn();
vi.mock('@/lib/api/categories', () => ({
  fetchCategories: () => mockFetchCategories(),
}));

// Mock cache utilities
const mockGetCachedCategories = vi.fn();
const mockSetCachedCategories = vi.fn();
vi.mock('@/lib/utils/category-cache', () => ({
  getCachedCategories: () => mockGetCachedCategories(),
  setCachedCategories: (categories: Category[]) => mockSetCachedCategories(categories),
}));

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Cooking',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
    image: {
      imageUrl: 'https://example.com/cooking.jpg',
      imageStoragePath: '/images/cooking.jpg',
      originalFileName: 'cooking.jpg',
      contentType: 'image/jpeg',
      fileSizeBytes: 1024,
      uploadedAt: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: '2',
    name: 'Fitness',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
  },
  {
    id: '3',
    name: 'Technology',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
  },
];

/**
 * CategoryFilterBar Keyboard Navigation Tests
 * Task 5.1: Write unit tests for CategoryFilterBar keyboard navigation
 * Requirements: 8.1, 8.3, 8.4, 8.6, 8.7
 */
describe('CategoryFilterBar - Keyboard Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCachedCategories.mockReturnValue(null);
    mockFetchCategories.mockResolvedValue({ items: mockCategories });
  });

  describe('Tab Key Navigation', () => {
    it('CategoryFilterBar_ShouldAllowTabNavigation_ThroughAllPills', async () => {
      const user = userEvent.setup();
      const onCategorySelect = vi.fn();
      
      render(
        <CategoryFilterBar
          selectedCategoryId={null}
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /filter by all/i })).toBeInTheDocument();
      });

      const allPill = screen.getByRole('tab', { name: /filter by all/i });
      const cookingPill = screen.getByRole('tab', { name: /filter by cooking/i });
      const fitnessPill = screen.getByRole('tab', { name: /filter by fitness/i });
      const techPill = screen.getByRole('tab', { name: /filter by technology/i });

      // Tab through pills
      allPill.focus();
      expect(document.activeElement).toBe(allPill);

      await user.tab();
      expect(document.activeElement).toBe(cookingPill);

      await user.tab();
      expect(document.activeElement).toBe(fitnessPill);

      await user.tab();
      expect(document.activeElement).toBe(techPill);
    });
  });

  describe('Arrow Key Navigation', () => {
    it('CategoryFilterBar_ShouldMoveToNextPill_WhenRightArrowPressed', async () => {
      const user = userEvent.setup();
      const onCategorySelect = vi.fn();
      
      render(
        <CategoryFilterBar
          selectedCategoryId={null}
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /filter by all/i })).toBeInTheDocument();
      });

      const allPill = screen.getByRole('tab', { name: /filter by all/i });
      const cookingPill = screen.getByRole('tab', { name: /filter by cooking/i });

      // Focus first pill
      allPill.focus();
      expect(document.activeElement).toBe(allPill);

      // Press Right Arrow
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(cookingPill);
    });

    it('CategoryFilterBar_ShouldMoveToPreviousPill_WhenLeftArrowPressed', async () => {
      const user = userEvent.setup();
      const onCategorySelect = vi.fn();
      
      render(
        <CategoryFilterBar
          selectedCategoryId={null}
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /filter by cooking/i })).toBeInTheDocument();
      });

      const allPill = screen.getByRole('tab', { name: /filter by all/i });
      const cookingPill = screen.getByRole('tab', { name: /filter by cooking/i });

      // Focus second pill
      cookingPill.focus();
      expect(document.activeElement).toBe(cookingPill);

      // Press Left Arrow
      await user.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(allPill);
    });

    it('CategoryFilterBar_ShouldWrapToFirstPill_WhenRightArrowPressedOnLastPill', async () => {
      const user = userEvent.setup();
      const onCategorySelect = vi.fn();
      
      render(
        <CategoryFilterBar
          selectedCategoryId={null}
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /filter by technology/i })).toBeInTheDocument();
      });

      const allPill = screen.getByRole('tab', { name: /filter by all/i });
      const techPill = screen.getByRole('tab', { name: /filter by technology/i });

      // Focus last pill
      techPill.focus();
      expect(document.activeElement).toBe(techPill);

      // Press Right Arrow - should wrap to first
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(allPill);
    });

    it('CategoryFilterBar_ShouldWrapToLastPill_WhenLeftArrowPressedOnFirstPill', async () => {
      const user = userEvent.setup();
      const onCategorySelect = vi.fn();
      
      render(
        <CategoryFilterBar
          selectedCategoryId={null}
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /filter by all/i })).toBeInTheDocument();
      });

      const allPill = screen.getByRole('tab', { name: /filter by all/i });
      const techPill = screen.getByRole('tab', { name: /filter by technology/i });

      // Focus first pill
      allPill.focus();
      expect(document.activeElement).toBe(allPill);

      // Press Left Arrow - should wrap to last
      await user.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(techPill);
    });

    it('CategoryFilterBar_ShouldNotTriggerSelection_WhenArrowKeyPressed', async () => {
      const user = userEvent.setup();
      const onCategorySelect = vi.fn();
      
      render(
        <CategoryFilterBar
          selectedCategoryId={null}
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /filter by all/i })).toBeInTheDocument();
      });

      const allPill = screen.getByRole('tab', { name: /filter by all/i });
      allPill.focus();

      // Press Right Arrow
      await user.keyboard('{ArrowRight}');

      // Should not trigger selection, only move focus
      expect(onCategorySelect).not.toHaveBeenCalled();
    });
  });

  describe('ARIA Attributes', () => {
    it('CategoryFilterBar_ShouldHaveTablistRole_OnContainer', async () => {
      const onCategorySelect = vi.fn();
      
      render(
        <CategoryFilterBar
          selectedCategoryId={null}
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('role', 'tablist');
    });

    it('CategoryFilterBar_ShouldHaveAriaLabel_OnTablist', async () => {
      const onCategorySelect = vi.fn();
      
      render(
        <CategoryFilterBar
          selectedCategoryId={null}
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Filter tips by category');
    });

    it('CategoryFilterBar_ShouldHaveAriaLiveRegion_ForAnnouncements', async () => {
      const onCategorySelect = vi.fn();
      
      const { container } = render(
        <CategoryFilterBar
          selectedCategoryId={null}
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });

      const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('ARIA Live Region Announcements', () => {
    it('CategoryFilterBar_ShouldAnnounceAllCategories_WhenAllSelected', async () => {
      const onCategorySelect = vi.fn();
      
      const { container } = render(
        <CategoryFilterBar
          selectedCategoryId={null}
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });

      const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
      expect(liveRegion).toHaveTextContent('All categories selected');
    });

    it('CategoryFilterBar_ShouldAnnounceCategoryName_WhenCategorySelected', async () => {
      const onCategorySelect = vi.fn();
      
      const { container, rerender } = render(
        <CategoryFilterBar
          selectedCategoryId={null}
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });

      // Select a category
      rerender(
        <CategoryFilterBar
          selectedCategoryId="1"
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion).toHaveTextContent('Cooking category selected');
      });
    });

    it('CategoryFilterBar_ShouldUpdateAnnouncement_WhenSelectionChanges', async () => {
      const onCategorySelect = vi.fn();
      
      const { container, rerender } = render(
        <CategoryFilterBar
          selectedCategoryId="1"
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });

      // Change selection
      rerender(
        <CategoryFilterBar
          selectedCategoryId="2"
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion).toHaveTextContent('Fitness category selected');
      });
    });
  });

  describe('Focus Management', () => {
    it('CategoryFilterBar_ShouldMaintainFocus_WhenArrowKeyPressed', async () => {
      const user = userEvent.setup();
      const onCategorySelect = vi.fn();
      
      render(
        <CategoryFilterBar
          selectedCategoryId={null}
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /filter by all/i })).toBeInTheDocument();
      });

      const allPill = screen.getByRole('tab', { name: /filter by all/i });
      allPill.focus();

      // Press Right Arrow multiple times
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement?.getAttribute('role')).toBe('tab');

      await user.keyboard('{ArrowRight}');
      expect(document.activeElement?.getAttribute('role')).toBe('tab');

      await user.keyboard('{ArrowRight}');
      expect(document.activeElement?.getAttribute('role')).toBe('tab');
    });

    it('CategoryFilterBar_ShouldNotLoseFocus_WhenWrappingAround', async () => {
      const user = userEvent.setup();
      const onCategorySelect = vi.fn();
      
      render(
        <CategoryFilterBar
          selectedCategoryId={null}
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /filter by all/i })).toBeInTheDocument();
      });

      const allPill = screen.getByRole('tab', { name: /filter by all/i });
      allPill.focus();

      // Wrap around from first to last
      await user.keyboard('{ArrowLeft}');
      expect(document.activeElement?.getAttribute('role')).toBe('tab');

      // Wrap around from last to first
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement?.getAttribute('role')).toBe('tab');
    });
  });

  describe('Keyboard and Mouse Interaction', () => {
    it('CategoryFilterBar_ShouldAllowBothKeyboardAndMouse_ForNavigation', async () => {
      const user = userEvent.setup();
      const onCategorySelect = vi.fn();
      
      render(
        <CategoryFilterBar
          selectedCategoryId={null}
          onCategorySelect={onCategorySelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /filter by all/i })).toBeInTheDocument();
      });

      const allPill = screen.getByRole('tab', { name: /filter by all/i });
      const cookingPill = screen.getByRole('tab', { name: /filter by cooking/i });

      // Use keyboard
      allPill.focus();
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(cookingPill);

      // Use mouse
      await user.click(allPill);
      expect(onCategorySelect).toHaveBeenCalledWith(null);
    });
  });
});
