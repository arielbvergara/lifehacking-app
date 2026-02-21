import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CategoryRow } from './category-row';

describe('CategoryRow', () => {
  const mockCategory = {
    id: 'cat-1',
    name: 'Productivity',
    iconUrl: 'https://example.com/icon.png',
    tipCount: 5,
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CategoryRow_Should_DisplayCategoryInformation_When_Rendered', () => {
    it('should display category name', () => {
      render(
        <CategoryRow
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText('Productivity')).toHaveLength(2); // Desktop and mobile
    });

    it('should display tip count with singular form', () => {
      const singleTipCategory = { ...mockCategory, tipCount: 1 };
      render(
        <CategoryRow
          category={singleTipCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText('1 tip')).toHaveLength(2); // Desktop and mobile
    });

    it('should display tip count with plural form', () => {
      render(
        <CategoryRow
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText('5 tips')).toHaveLength(2); // Desktop and mobile
    });

    it('should display category icon when iconUrl is provided', () => {
      const { container } = render(
        <CategoryRow
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const icons = container.querySelectorAll('img');
      expect(icons).toHaveLength(2); // Desktop and mobile
      expect(icons[0]).toHaveAttribute('src', mockCategory.iconUrl);
      expect(icons[1]).toHaveAttribute('src', mockCategory.iconUrl);
    });

    it('should display fallback icon when iconUrl is not provided', () => {
      const categoryWithoutIcon = { ...mockCategory, iconUrl: undefined };
      render(
        <CategoryRow
          category={categoryWithoutIcon}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText('📁')).toHaveLength(2); // Desktop and mobile
    });
  });

  describe('CategoryRow_Should_HandleEditAction_When_EditButtonClicked', () => {
    it('should call onEdit with category id when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CategoryRow
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButtons = screen.getAllByLabelText('Edit Productivity');
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith('cat-1');
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('CategoryRow_Should_HandleDeleteAction_When_DeleteButtonClicked', () => {
    it('should call onDelete with category id and name when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CategoryRow
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText('Delete Productivity');
      await user.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith('cat-1', 'Productivity');
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('CategoryRow_Should_DisplayResponsiveLayout_When_ScreenSizeChanges', () => {
    it('should render both desktop and mobile layouts', () => {
      render(
        <CategoryRow
          category={mockCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Both layouts should be in the DOM (CSS handles visibility)
      expect(screen.getAllByText('Productivity')).toHaveLength(2);
      expect(screen.getAllByText('5 tips')).toHaveLength(2);
    });
  });

  describe('CategoryRow_Should_HandleZeroTips_When_CategoryIsEmpty', () => {
    it('should display "0 tips" when category has no tips', () => {
      const emptyCategory = { ...mockCategory, tipCount: 0 };
      render(
        <CategoryRow
          category={emptyCategory}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getAllByText('0 tips')).toHaveLength(2); // Desktop and mobile
    });
  });
});
