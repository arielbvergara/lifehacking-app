import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SortDirectionToggle } from './sort-direction-toggle';

describe('SortDirectionToggle', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('SortDirectionToggle_ShouldRenderWithAscendingValue_WhenValueIsAsc', () => {
      render(
        <SortDirectionToggle 
          value="asc" 
          onChange={mockOnChange} 
          disabled={false} 
        />
      );

      expect(screen.getByRole('button', { name: /ascending/i })).toBeInTheDocument();
      expect(screen.getByText('Ascending')).toBeInTheDocument();
      expect(screen.getByText('↑')).toBeInTheDocument();
    });

    it('SortDirectionToggle_ShouldRenderWithDescendingValue_WhenValueIsDesc', () => {
      render(
        <SortDirectionToggle 
          value="desc" 
          onChange={mockOnChange} 
          disabled={false} 
        />
      );

      expect(screen.getByRole('button', { name: /descending/i })).toBeInTheDocument();
      expect(screen.getByText('Descending')).toBeInTheDocument();
      expect(screen.getByText('↓')).toBeInTheDocument();
    });

    it('SortDirectionToggle_ShouldRenderLabel_WhenRendered', () => {
      render(
        <SortDirectionToggle 
          value="asc" 
          onChange={mockOnChange} 
          disabled={false} 
        />
      );

      expect(screen.getByText('Sort Direction')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('SortDirectionToggle_ShouldCallOnChange_WhenClicked', async () => {
      const user = userEvent.setup();
      
      render(
        <SortDirectionToggle 
          value="asc" 
          onChange={mockOnChange} 
          disabled={false} 
        />
      );

      const button = screen.getByRole('button', { name: /ascending/i });
      await user.click(button);

      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('SortDirectionToggle_ShouldNotCallOnChange_WhenDisabledAndClicked', async () => {
      const user = userEvent.setup();
      
      render(
        <SortDirectionToggle 
          value="asc" 
          onChange={mockOnChange} 
          disabled={true} 
        />
      );

      const button = screen.getByRole('button', { name: /ascending/i });
      await user.click(button);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('SortDirectionToggle_ShouldBeDisabled_WhenDisabledPropIsTrue', () => {
      render(
        <SortDirectionToggle 
          value="asc" 
          onChange={mockOnChange} 
          disabled={true} 
        />
      );

      const button = screen.getByRole('button', { name: /ascending/i });
      expect(button).toBeDisabled();
    });

    it('SortDirectionToggle_ShouldNotBeDisabled_WhenDisabledPropIsFalse', () => {
      render(
        <SortDirectionToggle 
          value="asc" 
          onChange={mockOnChange} 
          disabled={false} 
        />
      );

      const button = screen.getByRole('button', { name: /ascending/i });
      expect(button).not.toBeDisabled();
    });

    it('SortDirectionToggle_ShouldHaveDisabledStyling_WhenDisabled', () => {
      render(
        <SortDirectionToggle 
          value="asc" 
          onChange={mockOnChange} 
          disabled={true} 
        />
      );

      const button = screen.getByRole('button', { name: /ascending/i });
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('Accessibility', () => {
    it('SortDirectionToggle_ShouldHaveAriaLabel_WhenRendered', () => {
      render(
        <SortDirectionToggle 
          value="asc" 
          onChange={mockOnChange} 
          disabled={false} 
        />
      );

      const button = screen.getByRole('button', { name: /sort direction: ascending/i });
      expect(button).toHaveAttribute('aria-label');
    });

    it('SortDirectionToggle_ShouldHaveAriaPressed_WhenRendered', () => {
      render(
        <SortDirectionToggle 
          value="desc" 
          onChange={mockOnChange} 
          disabled={false} 
        />
      );

      const button = screen.getByRole('button', { name: /descending/i });
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('SortDirectionToggle_ShouldHaveCorrectAriaPressed_WhenAscending', () => {
      render(
        <SortDirectionToggle 
          value="asc" 
          onChange={mockOnChange} 
          disabled={false} 
        />
      );

      const button = screen.getByRole('button', { name: /ascending/i });
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('SortDirectionToggle_ShouldHaveAriaHiddenOnIcon_WhenRendered', () => {
      const { container } = render(
        <SortDirectionToggle 
          value="asc" 
          onChange={mockOnChange} 
          disabled={false} 
        />
      );

      const icon = container.querySelector('span[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('↑');
    });
  });

  describe('Icon and Text Display', () => {
    it('SortDirectionToggle_ShouldDisplayUpArrow_WhenValueIsAsc', () => {
      render(
        <SortDirectionToggle 
          value="asc" 
          onChange={mockOnChange} 
          disabled={false} 
        />
      );

      expect(screen.getByText('↑')).toBeInTheDocument();
    });

    it('SortDirectionToggle_ShouldDisplayDownArrow_WhenValueIsDesc', () => {
      render(
        <SortDirectionToggle 
          value="desc" 
          onChange={mockOnChange} 
          disabled={false} 
        />
      );

      expect(screen.getByText('↓')).toBeInTheDocument();
    });

    it('SortDirectionToggle_ShouldDisplayAscendingText_WhenValueIsAsc', () => {
      render(
        <SortDirectionToggle 
          value="asc" 
          onChange={mockOnChange} 
          disabled={false} 
        />
      );

      expect(screen.getByText('Ascending')).toBeInTheDocument();
    });

    it('SortDirectionToggle_ShouldDisplayDescendingText_WhenValueIsDesc', () => {
      render(
        <SortDirectionToggle 
          value="desc" 
          onChange={mockOnChange} 
          disabled={false} 
        />
      );

      expect(screen.getByText('Descending')).toBeInTheDocument();
    });
  });
});
