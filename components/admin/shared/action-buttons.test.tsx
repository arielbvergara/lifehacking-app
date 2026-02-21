import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionButtons } from './action-buttons';

describe('ActionButtons', () => {
  describe('ActionButtons_ShouldCallOnEdit_WhenEditButtonClicked', () => {
    it('calls onEdit callback when edit button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(<ActionButtons onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const editButton = screen.getByLabelText('Edit');
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe('ActionButtons_ShouldCallOnDelete_WhenDeleteButtonClicked', () => {
    it('calls onDelete callback when delete button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(<ActionButtons onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByLabelText('Delete');
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).not.toHaveBeenCalled();
    });
  });

  describe('ActionButtons_ShouldHaveAccessibleLabels_WhenRendered', () => {
    it('renders buttons with default accessible labels', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(<ActionButtons onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      expect(screen.getByLabelText('Edit')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete')).toBeInTheDocument();
    });

    it('renders buttons with proper ARIA attributes', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(<ActionButtons onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const editButton = screen.getByLabelText('Edit');
      const deleteButton = screen.getByLabelText('Delete');

      expect(editButton).toHaveAttribute('type', 'button');
      expect(deleteButton).toHaveAttribute('type', 'button');
      expect(editButton).toHaveAttribute('aria-label', 'Edit');
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete');
    });
  });

  describe('ActionButtons_ShouldUseCustomLabels_WhenProvided', () => {
    it('renders buttons with custom accessible labels', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <ActionButtons
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          editLabel="Edit tip"
          deleteLabel="Delete tip"
        />
      );

      expect(screen.getByLabelText('Edit tip')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete tip')).toBeInTheDocument();
    });
  });

  describe('ActionButtons_ShouldRenderIcons_WhenRendered', () => {
    it('renders Material Icons for edit and delete', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      const { container } = render(
        <ActionButtons onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      const icons = container.querySelectorAll('.material-icons-round');
      expect(icons).toHaveLength(2);
      expect(icons[0]).toHaveTextContent('edit');
      expect(icons[1]).toHaveTextContent('delete');
    });

    it('marks icons as aria-hidden', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      const { container } = render(
        <ActionButtons onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      const icons = container.querySelectorAll('.material-icons-round');
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('ActionButtons_ShouldHaveConsistentStyling_WhenRendered', () => {
    it('applies consistent styling classes to both buttons', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(<ActionButtons onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const editButton = screen.getByLabelText('Edit');
      const deleteButton = screen.getByLabelText('Delete');

      // Both should have common base classes
      expect(editButton.className).toContain('p-2');
      expect(editButton.className).toContain('rounded-lg');
      expect(editButton.className).toContain('transition-colors');
      expect(editButton.className).toContain('focus:outline-none');
      expect(editButton.className).toContain('focus:ring-2');

      expect(deleteButton.className).toContain('p-2');
      expect(deleteButton.className).toContain('rounded-lg');
      expect(deleteButton.className).toContain('transition-colors');
      expect(deleteButton.className).toContain('focus:outline-none');
      expect(deleteButton.className).toContain('focus:ring-2');
    });

    it('applies different hover colors for edit and delete buttons', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(<ActionButtons onEdit={mockOnEdit} onDelete={mockOnDelete} />);

      const editButton = screen.getByLabelText('Edit');
      const deleteButton = screen.getByLabelText('Delete');

      // Edit button should have blue hover
      expect(editButton.className).toContain('hover:text-blue-600');
      expect(editButton.className).toContain('hover:bg-blue-50');

      // Delete button should have red hover
      expect(deleteButton.className).toContain('hover:text-red-600');
      expect(deleteButton.className).toContain('hover:bg-red-50');
    });
  });

  describe('ActionButtons_ShouldBeGroupedTogether_WhenRendered', () => {
    it('renders buttons in a flex container with gap', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      const { container } = render(
        <ActionButtons onEdit={mockOnEdit} onDelete={mockOnDelete} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('flex');
      expect(wrapper.className).toContain('items-center');
      expect(wrapper.className).toContain('gap-2');
    });
  });
});
