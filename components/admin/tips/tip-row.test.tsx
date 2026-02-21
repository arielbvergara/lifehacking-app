import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TipRow } from './tip-row';
import { TipSummary } from '@/lib/types/api';

// Mock the text utility
vi.mock('@/lib/utils/text', () => ({
  truncateText: vi.fn((text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }),
}));

describe('TipRow', () => {
  const mockTip: TipSummary = {
    id: 'tip-123',
    title: 'Test Tip Title',
    description: 'This is a test tip description that should be displayed in the card.',
    categoryId: 'cat-123',
    categoryName: 'Productivity',
    tags: ['test', 'productivity'],
    videoUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display', () => {
    it('should display tip title', () => {
      render(
        <TipRow
          tip={mockTip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const titles = screen.getAllByText('Test Tip Title');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('should display truncated description', () => {
      render(
        <TipRow
          tip={mockTip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const descriptions = screen.getAllByText(/This is a test tip description/);
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should display category name badge', () => {
      render(
        <TipRow
          tip={mockTip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const categoryBadges = screen.getAllByText('Productivity');
      expect(categoryBadges.length).toBeGreaterThan(0);
    });

    it('should display steps count placeholder', () => {
      render(
        <TipRow
          tip={mockTip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const stepsText = screen.getAllByText('N/A steps');
      expect(stepsText.length).toBeGreaterThan(0);
    });

    it('should display lightbulb icon', () => {
      render(
        <TipRow
          tip={mockTip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const icons = screen.getAllByText('💡');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Actions', () => {
    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TipRow
          tip={mockTip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButtons = screen.getAllByLabelText('Edit Test Tip Title');
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith('tip-123');
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TipRow
          tip={mockTip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText('Delete Test Tip Title');
      await user.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledWith('tip-123', 'Test Tip Title');
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Layout', () => {
    it('should render both desktop and mobile layouts', () => {
      const { container } = render(
        <TipRow
          tip={mockTip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Desktop layout (hidden on mobile)
      const desktopLayout = container.querySelector('.hidden.md\\:flex');
      expect(desktopLayout).toBeInTheDocument();

      // Mobile layout (hidden on desktop)
      const mobileLayout = container.querySelector('.md\\:hidden');
      expect(mobileLayout).toBeInTheDocument();
    });
  });

  describe('Category Badge Color', () => {
    it('should apply consistent color for same category name', () => {
      const { container: container1 } = render(
        <TipRow
          tip={mockTip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const { container: container2 } = render(
        <TipRow
          tip={mockTip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const badge1 = container1.querySelector('.inline-block.px-2.py-1');
      const badge2 = container2.querySelector('.inline-block.px-2.py-1');

      expect(badge1?.className).toBe(badge2?.className);
    });

    it('should apply color class to category badge', () => {
      const { container } = render(
        <TipRow
          tip={mockTip}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const badge = container.querySelector('.inline-block.px-2.py-1');
      const className = badge?.className || '';

      // Should have one of the color classes
      const hasColorClass = 
        className.includes('bg-blue-100') ||
        className.includes('bg-green-100') ||
        className.includes('bg-purple-100') ||
        className.includes('bg-orange-100') ||
        className.includes('bg-pink-100') ||
        className.includes('bg-indigo-100');

      expect(hasColorClass).toBe(true);
    });
  });

  describe('Long Content Handling', () => {
    it('should truncate long descriptions', () => {
      const longDescription = 'A'.repeat(200);
      const tipWithLongDescription: TipSummary = {
        ...mockTip,
        description: longDescription,
      };

      render(
        <TipRow
          tip={tipWithLongDescription}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const descriptions = screen.getAllByText(/A{100}\.\.\./);
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should handle long titles with truncation', () => {
      const longTitle = 'Very Long Title That Should Be Truncated Properly';
      const tipWithLongTitle: TipSummary = {
        ...mockTip,
        title: longTitle,
      };

      render(
        <TipRow
          tip={tipWithLongTitle}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const titles = screen.getAllByText(longTitle);
      expect(titles.length).toBeGreaterThan(0);
    });
  });
});
