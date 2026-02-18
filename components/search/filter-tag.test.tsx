import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { FilterTag } from './filter-tag';

describe('FilterTag', () => {
  describe('FilterTag_ShouldRenderWithLabel_WhenPropsProvided', () => {
    it('renders category filter tag with label', () => {
      render(
        <FilterTag
          label="Technology"
          onRemove={vi.fn()}
          type="category"
        />
      );

      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('renders search filter tag with label', () => {
      render(
        <FilterTag
          label='"productivity"'
          onRemove={vi.fn()}
          type="search"
        />
      );

      expect(screen.getByText('"productivity"')).toBeInTheDocument();
    });
  });

  describe('FilterTag_ShouldCallOnRemove_WhenCloseButtonClicked', () => {
    it('calls onRemove when close button is clicked', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      render(
        <FilterTag
          label="Technology"
          onRemove={onRemove}
          type="category"
        />
      );

      const closeButton = screen.getByRole('button', { name: /remove category filter/i });
      await user.click(closeButton);

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('calls onRemove for search filter', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      render(
        <FilterTag
          label='"test query"'
          onRemove={onRemove}
          type="search"
        />
      );

      const closeButton = screen.getByRole('button', { name: /remove search filter/i });
      await user.click(closeButton);

      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('FilterTag_ShouldHaveAccessibleLabel_WhenRendered', () => {
    it('has accessible label for category filter', () => {
      render(
        <FilterTag
          label="Technology"
          onRemove={vi.fn()}
          type="category"
        />
      );

      const closeButton = screen.getByRole('button', { name: 'Remove category filter: Technology' });
      expect(closeButton).toBeInTheDocument();
    });

    it('has accessible label for search filter', () => {
      render(
        <FilterTag
          label='"productivity"'
          onRemove={vi.fn()}
          type="search"
        />
      );

      const closeButton = screen.getByRole('button', { name: 'Remove search filter: "productivity"' });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('FilterTag_ShouldTruncateLongLabels_WhenLabelExceedsMaxWidth', () => {
    it('applies truncate class to label', () => {
      const longLabel = 'This is a very long category name that should be truncated';
      
      render(
        <FilterTag
          label={longLabel}
          onRemove={vi.fn()}
          type="category"
        />
      );

      const labelElement = screen.getByText(longLabel);
      expect(labelElement).toHaveClass('truncate');
      expect(labelElement).toHaveClass('max-w-[180px]');
    });
  });

  describe('FilterTag_ShouldHaveFocusStyles_WhenCloseButtonFocused', () => {
    it('close button has focus ring classes', () => {
      render(
        <FilterTag
          label="Technology"
          onRemove={vi.fn()}
          type="category"
        />
      );

      const closeButton = screen.getByRole('button', { name: /remove category filter/i });
      expect(closeButton).toHaveClass('focus:outline-none');
      expect(closeButton).toHaveClass('focus:ring-2');
      expect(closeButton).toHaveClass('focus:ring-primary');
    });
  });
});
