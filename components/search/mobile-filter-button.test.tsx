import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MobileFilterButton } from './mobile-filter-button';

describe('MobileFilterButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Rendering', () => {
    it('MobileFilterButton_ShouldRenderWithFiltersText_WhenRendered', () => {
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={0}
          isOpen={false}
        />
      );

      expect(screen.getByRole('button', { name: /open filters/i })).toBeInTheDocument();
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('MobileFilterButton_ShouldRenderFilterIcon_WhenRendered', () => {
      const { container } = render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={0}
          isOpen={false}
        />
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Badge Display', () => {
    it('MobileFilterButton_ShouldNotShowBadge_WhenActiveFilterCountIsZero', () => {
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={0}
          isOpen={false}
        />
      );

      const badge = screen.queryByText('0');
      expect(badge).not.toBeInTheDocument();
    });

    it('MobileFilterButton_ShouldShowBadge_WhenActiveFilterCountIsGreaterThanZero', () => {
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={2}
          isOpen={false}
        />
      );

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('MobileFilterButton_ShouldDisplayCorrectCount_WhenActiveFilterCountIsOne', () => {
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={1}
          isOpen={false}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('MobileFilterButton_ShouldDisplayCorrectCount_WhenActiveFilterCountIsMultiple', () => {
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={5}
          isOpen={false}
        />
      );

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('MobileFilterButton_ShouldHaveBadgeAriaLabel_WhenBadgeIsVisible', () => {
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={3}
          isOpen={false}
        />
      );

      const badge = screen.getByText('3');
      expect(badge).toHaveAttribute('aria-label', '3 active filters');
    });
  });

  describe('Interaction', () => {
    it('MobileFilterButton_ShouldCallOnClick_WhenClicked', async () => {
      const user = userEvent.setup();
      
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={0}
          isOpen={false}
        />
      );

      const button = screen.getByRole('button', { name: /open filters/i });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('MobileFilterButton_ShouldCallOnClick_WhenClickedWithActiveFilters', async () => {
      const user = userEvent.setup();
      
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={2}
          isOpen={false}
        />
      );

      const button = screen.getByRole('button', { name: /open filters \(2 active\)/i });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('MobileFilterButton_ShouldHaveAriaLabel_WhenNoActiveFilters', () => {
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={0}
          isOpen={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Open filters');
    });

    it('MobileFilterButton_ShouldHaveAriaLabelWithCount_WhenActiveFiltersPresent', () => {
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={3}
          isOpen={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Open filters (3 active)');
    });

    it('MobileFilterButton_ShouldHaveAriaHiddenOnIcon_WhenRendered', () => {
      const { container } = render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={0}
          isOpen={false}
        />
      );

      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('MobileFilterButton_ShouldHaveButtonType_WhenRendered', () => {
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={0}
          isOpen={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('MobileFilterButton_ShouldHaveAriaExpandedFalse_WhenSidebarIsClosed', () => {
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={0}
          isOpen={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('MobileFilterButton_ShouldHaveAriaExpandedTrue_WhenSidebarIsOpen', () => {
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={0}
          isOpen={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Styling', () => {
    it('MobileFilterButton_ShouldHaveFixedPositioning_WhenRendered', () => {
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={0}
          isOpen={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('fixed', 'bottom-6');
    });

    it('MobileFilterButton_ShouldHiddenOnDesktop_WhenRendered', () => {
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={0}
          isOpen={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('md:hidden');
    });

    it('MobileFilterButton_ShouldHaveMinimumTouchTarget_WhenRendered', () => {
      render(
        <MobileFilterButton 
          onClick={mockOnClick} 
          activeFilterCount={0}
          isOpen={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[44px]');
    });
  });
});
