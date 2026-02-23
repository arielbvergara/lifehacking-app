import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { DashboardControls } from './dashboard-controls';
import type { Period, StatisticsType } from '@/lib/types/admin-dashboard';

describe('DashboardControls', () => {
  const mockOnPeriodChange = vi.fn();
  const mockOnTypeChange = vi.fn();

  const defaultProps = {
    selectedPeriod: 'month' as Period,
    selectedType: 'amount' as StatisticsType,
    onPeriodChange: mockOnPeriodChange,
    onTypeChange: mockOnTypeChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Render_ShouldDisplayAllControls_Always', () => {
    it('should render period selector with all options', () => {
      render(<DashboardControls {...defaultProps} />);

      expect(screen.getByText('Period')).toBeInTheDocument();
      expect(screen.getByText('Day')).toBeInTheDocument();
      expect(screen.getByText('Week')).toBeInTheDocument();
      expect(screen.getByText('Month')).toBeInTheDocument();
      expect(screen.getByText('Year')).toBeInTheDocument();
    });

    it('should render statistics type selector with all options', () => {
      render(<DashboardControls {...defaultProps} />);

      expect(screen.getByText('Display As')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Percentage')).toBeInTheDocument();
    });
  });

  describe('PeriodSelection_ShouldHighlightSelected_Always', () => {
    it('should highlight the selected period', () => {
      const { container } = render(
        <DashboardControls {...defaultProps} selectedPeriod="week" />
      );

      const weekButton = container.querySelector('[data-testid="period-week"]');
      expect(weekButton).toHaveClass('bg-primary');
      expect(weekButton).toHaveClass('text-white');
    });

    it('should not highlight unselected periods', () => {
      const { container } = render(
        <DashboardControls {...defaultProps} selectedPeriod="month" />
      );

      const dayButton = container.querySelector('[data-testid="period-day"]');
      expect(dayButton).toHaveClass('text-gray-700');
      expect(dayButton).not.toHaveClass('bg-primary');
    });
  });

  describe('TypeSelection_ShouldHighlightSelected_Always', () => {
    it('should highlight the selected statistics type', () => {
      const { container } = render(
        <DashboardControls {...defaultProps} selectedType="percentage" />
      );

      const percentageButton = container.querySelector('[data-testid="type-percentage"]');
      expect(percentageButton).toHaveClass('bg-primary');
      expect(percentageButton).toHaveClass('text-white');
    });

    it('should not highlight unselected type', () => {
      const { container } = render(
        <DashboardControls {...defaultProps} selectedType="amount" />
      );

      const percentageButton = container.querySelector('[data-testid="type-percentage"]');
      expect(percentageButton).toHaveClass('text-gray-700');
      expect(percentageButton).not.toHaveClass('bg-primary');
    });
  });

  describe('PeriodChange_ShouldCallCallback_WhenClicked', () => {
    it('should call onPeriodChange when day is clicked', () => {
      const { container } = render(<DashboardControls {...defaultProps} />);

      const dayButton = container.querySelector('[data-testid="period-day"]');
      fireEvent.click(dayButton!);

      expect(mockOnPeriodChange).toHaveBeenCalledWith('day');
      expect(mockOnPeriodChange).toHaveBeenCalledTimes(1);
    });

    it('should call onPeriodChange when week is clicked', () => {
      const { container } = render(<DashboardControls {...defaultProps} />);

      const weekButton = container.querySelector('[data-testid="period-week"]');
      fireEvent.click(weekButton!);

      expect(mockOnPeriodChange).toHaveBeenCalledWith('week');
    });

    it('should call onPeriodChange when year is clicked', () => {
      const { container } = render(<DashboardControls {...defaultProps} />);

      const yearButton = container.querySelector('[data-testid="period-year"]');
      fireEvent.click(yearButton!);

      expect(mockOnPeriodChange).toHaveBeenCalledWith('year');
    });
  });

  describe('TypeChange_ShouldCallCallback_WhenClicked', () => {
    it('should call onTypeChange when amount is clicked', () => {
      const { container } = render(<DashboardControls {...defaultProps} />);

      const amountButton = container.querySelector('[data-testid="type-amount"]');
      fireEvent.click(amountButton!);

      expect(mockOnTypeChange).toHaveBeenCalledWith('amount');
      expect(mockOnTypeChange).toHaveBeenCalledTimes(1);
    });

    it('should call onTypeChange when percentage is clicked', () => {
      const { container } = render(<DashboardControls {...defaultProps} />);

      const percentageButton = container.querySelector('[data-testid="type-percentage"]');
      fireEvent.click(percentageButton!);

      expect(mockOnTypeChange).toHaveBeenCalledWith('percentage');
    });
  });

  describe('Layout_ShouldBeResponsive_Always', () => {
    it('should have responsive flex layout', () => {
      const { container } = render(<DashboardControls {...defaultProps} />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('flex-col');
      expect(wrapper).toHaveClass('sm:flex-row');
    });
  });

  describe('Accessibility_ShouldHaveProperAttributes_Always', () => {
    it('should have proper test ids for all period buttons', () => {
      const { container } = render(<DashboardControls {...defaultProps} />);

      expect(container.querySelector('[data-testid="period-day"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="period-week"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="period-month"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="period-year"]')).toBeInTheDocument();
    });

    it('should have proper test ids for all type buttons', () => {
      const { container } = render(<DashboardControls {...defaultProps} />);

      expect(container.querySelector('[data-testid="type-amount"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="type-percentage"]')).toBeInTheDocument();
    });
  });
});
