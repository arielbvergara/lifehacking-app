/**
 * Unit tests for FilterSidebar mobile behavior
 * Tests overlay rendering, animations, and interaction
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FilterSidebar } from './filter-sidebar';
import type { FilterSidebarProps } from './filter-sidebar';

// Mock CategoryFilterBar to avoid dependencies
vi.mock('./category-filter-bar', () => ({
  CategoryFilterBar: () => <div data-testid="category-filter-bar">Category Filter Bar</div>,
}));

// Mock other child components
vi.mock('./reset-filters-button', () => ({
  ResetFiltersButton: ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
    <button onClick={onClick} disabled={disabled} data-testid="reset-button">
      Reset All Filters
    </button>
  ),
}));

vi.mock('./sort-field-dropdown', () => ({
  SortFieldDropdown: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} data-testid="sort-dropdown">
      <option value="newest">Newest First</option>
      <option value="oldest">Oldest First</option>
      <option value="alphabetical-asc">Alphabetical A-Z</option>
      <option value="alphabetical-desc">Alphabetical Z-A</option>
    </select>
  ),
}));

describe('FilterSidebar - Mobile Behavior', () => {
  const defaultProps: FilterSidebarProps = {
    isOpen: false,
    onClose: vi.fn(),
    selectedCategoryId: null,
    onCategorySelect: vi.fn(),
    sortBy: 'newest',
    onSortChange: vi.fn(),
    onResetFilters: vi.fn(),
    hasActiveFilters: false,
    showCategoryFilter: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow before each test
    document.body.style.overflow = '';
  });

  describe('Overlay Rendering', () => {
    it('should render overlay when sidebar is open on mobile', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      // Find overlay by its classes
      const overlay = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(overlay).toBeInTheDocument();
    });

    it('should not render overlay when sidebar is closed', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={false} />
      );

      // Overlay should not exist
      const overlay = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(overlay).not.toBeInTheDocument();
    });

    it('should have semi-transparent black background (rgba(0,0,0,0.5))', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const overlay = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(overlay).toHaveClass('bg-black', 'bg-opacity-50');
    });

    it('should have 200ms fade transition on overlay', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const overlay = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(overlay).toHaveClass('transition-opacity', 'duration-200');
    });

    it('should hide overlay on desktop (md:hidden)', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const overlay = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(overlay).toHaveClass('md:hidden');
    });
  });

  describe('Overlay Interaction', () => {
    it('should call onClose when overlay is clicked', () => {
      const onClose = vi.fn();
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} onClose={onClose} />
      );

      const overlay = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(overlay).toBeInTheDocument();

      fireEvent.click(overlay!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should have aria-hidden="true" on overlay', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const overlay = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Close Button', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(
        <FilterSidebar {...defaultProps} isOpen={true} onClose={onClose} />
      );

      const closeButton = screen.getByLabelText('Close filters');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should render close button with correct aria-label', () => {
      render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const closeButton = screen.getByLabelText('Close filters');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have md:hidden class on close button (mobile only)', () => {
      render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const closeButton = screen.getByLabelText('Close filters');
      expect(closeButton).toHaveClass('md:hidden');
    });
  });

  describe('Sidebar Animation', () => {
    it('should have 300ms transition on sidebar', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('transition-transform', 'duration-300', 'ease-in-out');
    });

    it('should slide in from left when open (translate-x-0)', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('translate-x-0');
    });

    it('should slide out to left when closed (-translate-x-full)', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={false} />
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('-translate-x-full');
    });

    it('should use CSS transform for animation (not layout properties)', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const sidebar = container.querySelector('aside');
      // Verify it uses transform classes, not left/right positioning
      expect(sidebar).toHaveClass('transition-transform');
    });

    it('should be 280px wide on mobile', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('w-[280px]');
    });
  });

  describe('Z-Index Layering', () => {
    it('should have overlay at z-40', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const overlay = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(overlay).toHaveClass('z-40');
    });

    it('should have sidebar at z-50 (above overlay)', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('z-50');
    });
  });

  describe('Body Scroll Prevention', () => {
    it('should set body overflow to hidden when sidebar opens', () => {
      const { rerender } = render(
        <FilterSidebar {...defaultProps} isOpen={false} />
      );

      // Initially, body overflow should be empty or auto
      expect(document.body.style.overflow).toBe('');

      // Open sidebar
      rerender(<FilterSidebar {...defaultProps} isOpen={true} />);

      // Body overflow should be hidden
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body overflow when sidebar closes', () => {
      const { rerender } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      // Body overflow should be hidden
      expect(document.body.style.overflow).toBe('hidden');

      // Close sidebar
      rerender(<FilterSidebar {...defaultProps} isOpen={false} />);

      // Body overflow should be restored
      expect(document.body.style.overflow).toBe('');
    });

    it('should restore body overflow on unmount', () => {
      const { unmount } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      // Body overflow should be hidden
      expect(document.body.style.overflow).toBe('hidden');

      // Unmount component
      unmount();

      // Body overflow should be restored
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close sidebar when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(
        <FilterSidebar {...defaultProps} isOpen={true} onClose={onClose} />
      );

      // Press Escape key
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close sidebar when Escape is pressed if sidebar is closed', () => {
      const onClose = vi.fn();
      render(
        <FilterSidebar {...defaultProps} isOpen={false} onClose={onClose} />
      );

      // Press Escape key
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not close sidebar when other keys are pressed', () => {
      const onClose = vi.fn();
      render(
        <FilterSidebar {...defaultProps} isOpen={true} onClose={onClose} />
      );

      // Press other keys
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      fireEvent.keyDown(document, { key: 'Tab' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    it('should be fixed position on mobile', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('fixed');
    });

    it('should be static position on desktop (md:static)', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('md:static');
    });

    it('should always be visible on desktop (md:translate-x-0)', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={false} />
      );

      const sidebar = container.querySelector('aside');
      // Even when closed, desktop should show it
      expect(sidebar).toHaveClass('md:translate-x-0');
    });
  });

  describe('Accessibility', () => {
    it('should have role="complementary" on sidebar', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveAttribute('role', 'complementary');
    });

    it('should have aria-label on sidebar', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveAttribute('aria-label', 'Filter sidebar');
    });

    it('should have focus styles on close button', () => {
      render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const closeButton = screen.getByLabelText('Close filters');
      expect(closeButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-primary');
    });
  });
});
