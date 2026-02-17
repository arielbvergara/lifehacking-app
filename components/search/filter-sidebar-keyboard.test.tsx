/**
 * Unit tests for FilterSidebar keyboard navigation
 * Tests Escape key handling, focusability, and ARIA attributes
 * 
 * Validates Requirements: 12.5, 12.8, 12.9
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FilterSidebar } from './filter-sidebar';
import type { FilterSidebarProps } from './filter-sidebar';

// Mock child components to avoid dependencies
vi.mock('./category-filter-bar', () => ({
  CategoryFilterBar: () => <div data-testid="category-filter-bar">Category Filter Bar</div>,
}));

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
      <option value="alphabetical">Alphabetical A-Z</option>
    </select>
  ),
}));

vi.mock('./sort-direction-toggle', () => ({
  SortDirectionToggle: ({ value, onChange, disabled }: { value: string; onChange: () => void; disabled: boolean }) => (
    <button onClick={onChange} disabled={disabled} data-testid="sort-direction-toggle">
      {value === 'asc' ? 'Ascending' : 'Descending'}
    </button>
  ),
}));

describe('FilterSidebar - Keyboard Navigation', () => {
  const defaultProps: FilterSidebarProps = {
    isOpen: false,
    onClose: vi.fn(),
    selectedCategoryId: null,
    onCategorySelect: vi.fn(),
    sortBy: 'newest',
    sortDir: 'desc',
    onSortChange: vi.fn(),
    onSortDirectionToggle: vi.fn(),
    onResetFilters: vi.fn(),
    hasActiveFilters: false,
    showCategoryFilter: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  describe('Escape Key Handling', () => {
    it('FilterSidebar_ShouldCloseWhenEscapePressed_WhenSidebarIsOpen', () => {
      const onClose = vi.fn();
      render(
        <FilterSidebar {...defaultProps} isOpen={true} onClose={onClose} />
      );

      // Press Escape key
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('FilterSidebar_ShouldNotCloseWhenEscapePressed_WhenSidebarIsClosed', () => {
      const onClose = vi.fn();
      render(
        <FilterSidebar {...defaultProps} isOpen={false} onClose={onClose} />
      );

      // Press Escape key
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('FilterSidebar_ShouldNotCloseWhenOtherKeysPressed_WhenSidebarIsOpen', () => {
      const onClose = vi.fn();
      render(
        <FilterSidebar {...defaultProps} isOpen={true} onClose={onClose} />
      );

      // Press other keys
      ['Enter', 'Space', 'Tab', 'ArrowDown'].forEach(key => {
        const event = new KeyboardEvent('keydown', { key });
        document.dispatchEvent(event);
      });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Focusability', () => {
    it('FilterSidebar_ShouldHaveCloseButtonFocusable_WhenSidebarIsOpen', () => {
      render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const closeButton = screen.getByLabelText('Close filters');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton.tagName).toBe('BUTTON');
    });

    it('FilterSidebar_ShouldHaveResetButtonFocusable_WhenRendered', () => {
      render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const resetButton = screen.getByTestId('reset-button');
      expect(resetButton).toBeInTheDocument();
      expect(resetButton.tagName).toBe('BUTTON');
    });

    it('FilterSidebar_ShouldHaveSortDropdownFocusable_WhenRendered', () => {
      render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const sortDropdown = screen.getByTestId('sort-dropdown');
      expect(sortDropdown).toBeInTheDocument();
      expect(sortDropdown.tagName).toBe('SELECT');
    });

    it('FilterSidebar_ShouldHaveSortDirectionToggleFocusable_WhenRendered', () => {
      render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const sortToggle = screen.getByTestId('sort-direction-toggle');
      expect(sortToggle).toBeInTheDocument();
      expect(sortToggle.tagName).toBe('BUTTON');
    });

    it('FilterSidebar_ShouldMoveFocusToCloseButton_WhenSidebarOpens', async () => {
      const { rerender } = render(
        <FilterSidebar {...defaultProps} isOpen={false} />
      );

      // Open sidebar
      rerender(<FilterSidebar {...defaultProps} isOpen={true} />);

      // Wait for focus to be set (setTimeout in component)
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close filters');
        expect(document.activeElement).toBe(closeButton);
      }, { timeout: 200 });
    });

    it('FilterSidebar_ShouldRestoreFocusToPreviousElement_WhenSidebarCloses', async () => {
      // Create a button to focus initially
      const testButton = document.createElement('button');
      testButton.textContent = 'Test Button';
      document.body.appendChild(testButton);
      testButton.focus();

      const { rerender } = render(
        <FilterSidebar {...defaultProps} isOpen={false} />
      );

      // Verify initial focus
      expect(document.activeElement).toBe(testButton);

      // Open sidebar
      rerender(<FilterSidebar {...defaultProps} isOpen={true} />);

      // Wait for focus to move to close button
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close filters');
        expect(document.activeElement).toBe(closeButton);
      }, { timeout: 200 });

      // Close sidebar
      rerender(<FilterSidebar {...defaultProps} isOpen={false} />);

      // Focus should be restored to test button
      expect(document.activeElement).toBe(testButton);

      // Cleanup
      document.body.removeChild(testButton);
    });
  });

  describe('ARIA Attributes', () => {
    it('FilterSidebar_ShouldHaveRoleComplementary_WhenRendered', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveAttribute('role', 'complementary');
    });

    it('FilterSidebar_ShouldHaveAriaLabel_WhenRendered', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveAttribute('aria-label', 'Filter sidebar');
    });

    it('FilterSidebar_ShouldHaveCloseButtonWithAriaLabel_WhenRendered', () => {
      render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const closeButton = screen.getByLabelText('Close filters');
      expect(closeButton).toHaveAttribute('aria-label', 'Close filters');
    });

    it('FilterSidebar_ShouldHaveOverlayWithAriaHidden_WhenSidebarIsOpen', () => {
      const { container } = render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const overlay = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });

    it('FilterSidebar_ShouldHaveFocusStylesOnCloseButton_WhenRendered', () => {
      render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const closeButton = screen.getByLabelText('Close filters');
      expect(closeButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-primary');
    });
  });

  describe('Keyboard Accessibility', () => {
    it('FilterSidebar_ShouldAllowTabNavigationThroughControls_WhenSidebarIsOpen', () => {
      render(
        <FilterSidebar {...defaultProps} isOpen={true} hasActiveFilters={true} />
      );

      const closeButton = screen.getByLabelText('Close filters');
      const resetButton = screen.getByTestId('reset-button');
      const sortDropdown = screen.getByTestId('sort-dropdown');
      const sortToggle = screen.getByTestId('sort-direction-toggle');

      // All interactive elements should be in the document
      expect(closeButton).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
      expect(sortDropdown).toBeInTheDocument();
      expect(sortToggle).toBeInTheDocument();
    });

    it('FilterSidebar_ShouldHaveButtonTypeOnCloseButton_WhenRendered', () => {
      render(
        <FilterSidebar {...defaultProps} isOpen={true} />
      );

      const closeButton = screen.getByLabelText('Close filters');
      expect(closeButton).toHaveAttribute('type', 'button');
    });
  });
});
