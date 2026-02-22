import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './pagination';

describe('Pagination Component', () => {
  describe('Button State Management', () => {
    it('Pagination_ShouldDisablePreviousButton_WhenOnFirstPage', () => {
      // Arrange
      const onPageChange = vi.fn();
      
      // Act
      render(
        <Pagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={onPageChange}
          itemLabel="tips"
        />
      );
      
      // Assert
      const previousButtons = screen.getAllByLabelText('Previous page');
      previousButtons.forEach(button => {
        expect(button).toHaveAttribute('disabled');
      });
    });

    it('Pagination_ShouldDisableNextButton_WhenOnLastPage', () => {
      // Arrange
      const onPageChange = vi.fn();
      
      // Act
      render(
        <Pagination
          currentPage={10}
          totalItems={100}
          pageSize={10}
          onPageChange={onPageChange}
          itemLabel="tips"
        />
      );
      
      // Assert
      const nextButtons = screen.getAllByLabelText('Next page');
      nextButtons.forEach(button => {
        expect(button).toHaveAttribute('disabled');
      });
    });

    it('Pagination_ShouldEnableBothButtons_WhenOnMiddlePage', () => {
      // Arrange
      const onPageChange = vi.fn();
      
      // Act
      render(
        <Pagination
          currentPage={5}
          totalItems={100}
          pageSize={10}
          onPageChange={onPageChange}
          itemLabel="tips"
        />
      );
      
      // Assert
      const previousButtons = screen.getAllByLabelText('Previous page');
      const nextButtons = screen.getAllByLabelText('Next page');
      
      previousButtons.forEach(button => {
        expect(button).not.toHaveAttribute('disabled');
      });
      
      nextButtons.forEach(button => {
        expect(button).not.toHaveAttribute('disabled');
      });
    });
  });

  describe('Page Change Events', () => {
    it('Pagination_ShouldEmitPreviousPageNumber_WhenPreviousButtonClicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      
      render(
        <Pagination
          currentPage={5}
          totalItems={100}
          pageSize={10}
          onPageChange={onPageChange}
          itemLabel="tips"
        />
      );
      
      // Act
      const previousButtons = screen.getAllByLabelText('Previous page');
      await user.click(previousButtons[0]);
      
      // Assert
      expect(onPageChange).toHaveBeenCalledWith(4);
      expect(onPageChange).toHaveBeenCalledTimes(1);
    });

    it('Pagination_ShouldEmitNextPageNumber_WhenNextButtonClicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      
      render(
        <Pagination
          currentPage={5}
          totalItems={100}
          pageSize={10}
          onPageChange={onPageChange}
          itemLabel="tips"
        />
      );
      
      // Act
      const nextButtons = screen.getAllByLabelText('Next page');
      await user.click(nextButtons[0]);
      
      // Assert
      expect(onPageChange).toHaveBeenCalledWith(6);
      expect(onPageChange).toHaveBeenCalledTimes(1);
    });

    it('Pagination_ShouldNotEmitEvent_WhenPreviousButtonClickedOnFirstPage', async () => {
      // Arrange
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      
      render(
        <Pagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={onPageChange}
          itemLabel="tips"
        />
      );
      
      // Act
      const previousButtons = screen.getAllByLabelText('Previous page');
      await user.click(previousButtons[0]);
      
      // Assert
      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('Pagination_ShouldNotEmitEvent_WhenNextButtonClickedOnLastPage', async () => {
      // Arrange
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      
      render(
        <Pagination
          currentPage={10}
          totalItems={100}
          pageSize={10}
          onPageChange={onPageChange}
          itemLabel="tips"
        />
      );
      
      // Act
      const nextButtons = screen.getAllByLabelText('Next page');
      await user.click(nextButtons[0]);
      
      // Assert
      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Display Text Format', () => {
    it('Pagination_ShouldDisplayCorrectRange_WhenOnFirstPage', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={1}
          totalItems={100}
          pageSize={10}
          onPageChange={vi.fn()}
          itemLabel="tips"
        />
      );
      
      // Assert
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      const text = screen.getByText(/Showing/).textContent;
      expect(text).toBe('Showing 1 to 10 of 100 tips');
    });

    it('Pagination_ShouldDisplayCorrectRange_WhenOnMiddlePage', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={5}
          totalItems={100}
          pageSize={10}
          onPageChange={vi.fn()}
          itemLabel="tips"
        />
      );
      
      // Assert
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      const text = screen.getByText(/Showing/).textContent;
      expect(text).toBe('Showing 41 to 50 of 100 tips');
    });

    it('Pagination_ShouldDisplayCorrectRange_WhenOnLastPageWithPartialResults', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={11}
          totalItems={105}
          pageSize={10}
          onPageChange={vi.fn()}
          itemLabel="tips"
        />
      );
      
      // Assert
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      const text = screen.getByText(/Showing/).textContent;
      expect(text).toBe('Showing 101 to 105 of 105 tips');
    });

    it('Pagination_ShouldUseCustomItemLabel_WhenProvided', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={1}
          totalItems={50}
          pageSize={10}
          onPageChange={vi.fn()}
          itemLabel="categories"
        />
      );
      
      // Assert
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      const text = screen.getByText(/Showing/).textContent;
      expect(text).toBe('Showing 1 to 10 of 50 categories');
    });

    it('Pagination_ShouldUseDefaultItemLabel_WhenNotProvided', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={1}
          totalItems={50}
          pageSize={10}
          onPageChange={vi.fn()}
        />
      );
      
      // Assert
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      const text = screen.getByText(/Showing/).textContent;
      expect(text).toBe('Showing 1 to 10 of 50 items');
    });

    it('Pagination_ShouldDisplayZeroRange_WhenNoItems', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={1}
          totalItems={0}
          pageSize={10}
          onPageChange={vi.fn()}
          itemLabel="tips"
        />
      );
      
      // Assert
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      const text = screen.getByText(/Showing/).textContent;
      expect(text).toBe('Showing 0 to 0 of 0 tips');
    });
  });

  describe('Edge Cases', () => {
    it('Pagination_ShouldHandleSinglePage_WhenTotalItemsLessThanPageSize', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={1}
          totalItems={5}
          pageSize={10}
          onPageChange={vi.fn()}
          itemLabel="tips"
        />
      );
      
      // Assert
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      const text = screen.getByText(/Showing/).textContent;
      expect(text).toBe('Showing 1 to 5 of 5 tips');
      
      const previousButtons = screen.getAllByLabelText('Previous page');
      const nextButtons = screen.getAllByLabelText('Next page');
      
      previousButtons.forEach(button => {
        expect(button).toHaveAttribute('disabled');
      });
      
      nextButtons.forEach(button => {
        expect(button).toHaveAttribute('disabled');
      });
    });

    it('Pagination_ShouldCalculateTotalPagesCorrectly_WhenItemsDontDivideEvenly', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={1}
          totalItems={95}
          pageSize={10}
          onPageChange={vi.fn()}
          itemLabel="tips"
        />
      );
      
      // Assert - Should have 10 pages (95 / 10 = 9.5, rounded up to 10)
      const nextButtons = screen.getAllByLabelText('Next page');
      nextButtons.forEach(button => {
        expect(button).not.toHaveAttribute('disabled');
      });
    });
  });

  describe('Accessibility', () => {
    it('Pagination_ShouldHaveAccessibleLabels_WhenRendered', () => {
      // Arrange & Act
      render(
        <Pagination
          currentPage={5}
          totalItems={100}
          pageSize={10}
          onPageChange={vi.fn()}
          itemLabel="tips"
        />
      );
      
      // Assert
      expect(screen.getAllByLabelText('Previous page')).toHaveLength(2); // Mobile + Desktop
      expect(screen.getAllByLabelText('Next page')).toHaveLength(2); // Mobile + Desktop
    });

    it('Pagination_ShouldHaveButtonType_WhenRendered', () => {
      // Arrange & Act
      const { container } = render(
        <Pagination
          currentPage={5}
          totalItems={100}
          pageSize={10}
          onPageChange={vi.fn()}
          itemLabel="tips"
        />
      );
      
      // Assert
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });
});
