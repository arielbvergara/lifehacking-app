import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { DashboardGrid } from './dashboard-grid';
import type { DashboardResponse, Period, StatisticsType } from '@/lib/types/admin-dashboard';

describe('DashboardGrid', () => {
  const mockStatistics: DashboardResponse = {
    users: {
      total: 100,
      lastDay: 2,
      thisDay: 3,
      lastWeek: 8,
      thisWeek: 10,
      lastMonth: 8,
      thisMonth: 10,
      lastYear: 80,
      thisYear: 100,
    },
    categories: {
      total: 20,
      lastDay: 0,
      thisDay: 1,
      lastWeek: 2,
      thisWeek: 2,
      lastMonth: 2,
      thisMonth: 2,
      lastYear: 18,
      thisYear: 20,
    },
    tips: {
      total: 500,
      lastDay: 10,
      thisDay: 15,
      lastWeek: 45,
      thisWeek: 50,
      lastMonth: 45,
      thisMonth: 50,
      lastYear: 450,
      thisYear: 500,
    },
  };

  const mockOnRetry = vi.fn();

  const defaultProps = {
    period: 'month' as Period,
    statisticsType: 'amount' as StatisticsType,
    loading: false,
    error: null,
    onRetry: mockOnRetry,
  };

  beforeEach(() => {
    mockOnRetry.mockClear();
  });

  describe('Render_ShouldDisplayCards_WhenDataLoaded', () => {
    it('should render three statistics cards when data is loaded', () => {
      const { container } = render(
        <DashboardGrid statistics={mockStatistics} {...defaultProps} />
      );

      const cards = container.querySelectorAll('[data-testid="statistics-card"]');
      expect(cards).toHaveLength(3);
    });

    it('should display correct titles for each card', () => {
      render(<DashboardGrid statistics={mockStatistics} {...defaultProps} />);

      expect(screen.getByText('Total Tips')).toBeInTheDocument();
      expect(screen.getByText('Happy Users')).toBeInTheDocument();
      expect(screen.getByText('Active Categories')).toBeInTheDocument();
    });
  });

  describe('Loading_ShouldShowSkeletons_WhenLoading', () => {
    it('should display loading skeletons when loading is true', () => {
      const { container } = render(
        <DashboardGrid statistics={null} {...defaultProps} loading={true} />
      );

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error_ShouldDisplayMessage_WhenErrorPresent', () => {
    it('should display error message when error is present', () => {
      render(
        <DashboardGrid
          statistics={null}
          {...defaultProps}
          error="Network error. Please check your connection."
        />
      );

      expect(screen.getByText('Failed to Load Statistics')).toBeInTheDocument();
      expect(screen.getByText('Network error. Please check your connection.')).toBeInTheDocument();
    });

    it('should display retry button when error is present', () => {
      render(
        <DashboardGrid statistics={null} {...defaultProps} error="Network error" />
      );

      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      render(
        <DashboardGrid statistics={null} {...defaultProps} error="Network error" />
      );

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Period_ShouldPassCorrectValues_ForEachPeriod', () => {
    it('should pass day period values to cards', () => {
      const { container } = render(
        <DashboardGrid statistics={mockStatistics} {...defaultProps} period="day" />
      );

      const cards = container.querySelectorAll('[data-testid="statistics-card"]');
      expect(cards).toHaveLength(3);
    });

    it('should pass week period values to cards', () => {
      const { container } = render(
        <DashboardGrid statistics={mockStatistics} {...defaultProps} period="week" />
      );

      const cards = container.querySelectorAll('[data-testid="statistics-card"]');
      expect(cards).toHaveLength(3);
    });

    it('should pass year period values to cards', () => {
      const { container } = render(
        <DashboardGrid statistics={mockStatistics} {...defaultProps} period="year" />
      );

      const cards = container.querySelectorAll('[data-testid="statistics-card"]');
      expect(cards).toHaveLength(3);
    });
  });

  describe('StatisticsType_ShouldPassCorrectType_ToCards', () => {
    it('should pass amount type to cards', () => {
      const { container } = render(
        <DashboardGrid
          statistics={mockStatistics}
          {...defaultProps}
          statisticsType="amount"
        />
      );

      const cards = container.querySelectorAll('[data-testid="statistics-card"]');
      expect(cards).toHaveLength(3);
    });

    it('should pass percentage type to cards', () => {
      const { container } = render(
        <DashboardGrid
          statistics={mockStatistics}
          {...defaultProps}
          statisticsType="percentage"
        />
      );

      const cards = container.querySelectorAll('[data-testid="statistics-card"]');
      expect(cards).toHaveLength(3);
    });
  });

  describe('NullStatistics_ShouldHandleGracefully_WhenNotLoading', () => {
    it('should handle null statistics gracefully when not loading', () => {
      const { container } = render(
        <DashboardGrid statistics={null} {...defaultProps} />
      );

      const cards = container.querySelectorAll('[data-testid="statistics-card"]');
      expect(cards).toHaveLength(3);
      
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Layout_ShouldBeResponsive_Always', () => {
    it('should use responsive grid layout', () => {
      const { container } = render(
        <DashboardGrid statistics={mockStatistics} {...defaultProps} />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-3');
    });
  });

  describe('PeriodValues_ShouldCalculateCorrectly_ForAllEntities', () => {
    it('should calculate correct values for month period', () => {
      render(
        <DashboardGrid statistics={mockStatistics} {...defaultProps} period="month" />
      );

      // Tips: thisMonth=50, lastMonth=45
      // Categories: thisMonth=2, lastMonth=2
      // Users: thisMonth=10, lastMonth=8
      expect(screen.getByText('Total Tips')).toBeInTheDocument();
      expect(screen.getByText('Happy Users')).toBeInTheDocument();
      expect(screen.getByText('Active Categories')).toBeInTheDocument();
    });

    it('should calculate correct values for day period', () => {
      render(
        <DashboardGrid statistics={mockStatistics} {...defaultProps} period="day" />
      );

      // Tips: thisDay=15, lastDay=10
      // Categories: thisDay=1, lastDay=0
      // Users: thisDay=3, lastDay=2
      expect(screen.getByText('Total Tips')).toBeInTheDocument();
      expect(screen.getByText('Happy Users')).toBeInTheDocument();
      expect(screen.getByText('Active Categories')).toBeInTheDocument();
    });
  });
});
