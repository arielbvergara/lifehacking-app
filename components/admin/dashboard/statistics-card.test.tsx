import { render, screen } from '@testing-library/react';
import { StatisticsCard } from './statistics-card';
import type { Period, StatisticsType } from '@/lib/types/admin-dashboard';

describe('StatisticsCard', () => {
  const mockIcon = <span className="material-icons-round">people</span>;
  const defaultProps = {
    bgColor: 'green' as const,
    href: '/admin/users',
    period: 'month' as Period,
    statisticsType: 'amount' as StatisticsType,
  };

  describe('Display_ShouldShowTotalAndGrowth_WhenAmountMode', () => {
    it('should display total value and growth indicator in amount mode', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={1248}
          currentPeriod={12}
          previousPeriod={8}
          {...defaultProps}
        />
      );

      expect(screen.getByText('1,248')).toBeInTheDocument();
      
      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      expect(growthIndicator).toBeInTheDocument();
    });

    it('should display title and icon', () => {
      render(
        <StatisticsCard
          title="Total Tips"
          icon={mockIcon}
          total={500}
          currentPeriod={50}
          previousPeriod={45}
          {...defaultProps}
        />
      );

      expect(screen.getByText('Total Tips')).toBeInTheDocument();
      expect(screen.getByText('people')).toBeInTheDocument();
    });
  });

  describe('Display_ShouldShowPercentage_WhenPercentageMode', () => {
    it('should display percentage change instead of total when in percentage mode', () => {
      render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={1248}
          currentPeriod={12}
          previousPeriod={8}
          {...defaultProps}
          statisticsType="percentage"
        />
      );

      const percentages = screen.getAllByText('+50%');
      expect(percentages.length).toBeGreaterThan(0);
      expect(screen.getByText('Total: 1,248')).toBeInTheDocument();
    });

    it('should calculate negative percentage correctly', () => {
      render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={100}
          currentPeriod={6}
          previousPeriod={10}
          {...defaultProps}
          statisticsType="percentage"
        />
      );

      const percentages = screen.getAllByText('-40%');
      expect(percentages.length).toBeGreaterThan(0);
    });

    it('should handle zero previous value', () => {
      render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={100}
          currentPeriod={10}
          previousPeriod={0}
          {...defaultProps}
          statisticsType="percentage"
        />
      );

      const percentages = screen.getAllByText('+100%');
      expect(percentages.length).toBeGreaterThan(0);
    });
  });

  describe('Growth_ShouldShowPositive_WhenCurrentGreaterThanPrevious', () => {
    it('should display positive growth with trending up icon', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={100}
          currentPeriod={12}
          previousPeriod={8}
          {...defaultProps}
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      const greenText = growthIndicator?.querySelector('.text-green-600');
      expect(greenText).toBeInTheDocument();
      
      const trendingIcon = growthIndicator?.querySelector('.material-icons-round');
      expect(trendingIcon?.textContent).toBe('trending_up');
    });

    it('should calculate growth percentage correctly for different periods', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Categories"
          icon={mockIcon}
          total={100}
          currentPeriod={20}
          previousPeriod={10}
          {...defaultProps}
          period="week"
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      expect(growthIndicator?.textContent).toContain('+100% growth');
    });
  });

  describe('Growth_ShouldShowNegative_WhenCurrentLessThanPrevious', () => {
    it('should display negative growth with trending down icon', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={100}
          currentPeriod={6}
          previousPeriod={10}
          {...defaultProps}
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      const redText = growthIndicator?.querySelector('.text-red-600');
      expect(redText).toBeInTheDocument();
      
      const trendingIcon = growthIndicator?.querySelector('.material-icons-round');
      expect(trendingIcon?.textContent).toBe('trending_down');
      
      expect(growthIndicator?.textContent).toContain('-40% decline');
    });
  });

  describe('Growth_ShouldShowNeutral_WhenNoChange', () => {
    it('should display neutral indicator when current equals previous', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Categories"
          icon={mockIcon}
          total={20}
          currentPeriod={5}
          previousPeriod={5}
          {...defaultProps}
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      const grayText = growthIndicator?.querySelector('.text-gray-500');
      expect(grayText).toBeInTheDocument();
      
      const neutralIcon = growthIndicator?.querySelector('.material-icons-round');
      expect(neutralIcon?.textContent).toBe('remove');
      
      expect(growthIndicator?.textContent).toContain('No change');
    });
  });

  describe('Period_ShouldDisplayCorrectLabel_ForEachPeriod', () => {
    it('should display "today" for day period', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={10}
          currentPeriod={5}
          previousPeriod={3}
          {...defaultProps}
          period="day"
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      expect(growthIndicator?.textContent).toContain('today');
    });

    it('should display "this week" for week period', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={10}
          currentPeriod={5}
          previousPeriod={3}
          {...defaultProps}
          period="week"
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      expect(growthIndicator?.textContent).toContain('this week');
    });

    it('should display "this year" for year period', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={10}
          currentPeriod={5}
          previousPeriod={3}
          {...defaultProps}
          period="year"
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      expect(growthIndicator?.textContent).toContain('this year');
    });
  });

  describe('EdgeCase_ShouldHandleZeroPrevious_Correctly', () => {
    it('should display growth text when previous is 0 and current > 0', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={10}
          currentPeriod={10}
          previousPeriod={0}
          {...defaultProps}
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      expect(growthIndicator?.textContent).toContain('10 this month');
    });

    it('should display neutral when both previous and current are 0', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={0}
          currentPeriod={0}
          previousPeriod={0}
          {...defaultProps}
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      const grayText = growthIndicator?.querySelector('.text-gray-500');
      expect(grayText).toBeInTheDocument();
      expect(growthIndicator?.textContent).toContain('No change');
    });
  });

  describe('Loading_ShouldShowSkeleton_WhenLoading', () => {
    it('should display skeleton loading state when loading prop is true', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={100}
          currentPeriod={10}
          previousPeriod={8}
          loading={true}
          {...defaultProps}
        />
      );

      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
      
      expect(screen.queryByText('Total Users')).not.toBeInTheDocument();
      expect(screen.queryByText('100')).not.toBeInTheDocument();
    });

    it('should display actual content when loading prop is false', () => {
      render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={100}
          currentPeriod={10}
          previousPeriod={8}
          loading={false}
          {...defaultProps}
        />
      );

      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Formatting_ShouldFormatNumbers_Correctly', () => {
    it('should format large numbers with commas', () => {
      render(
        <StatisticsCard
          title="Total Tips"
          icon={mockIcon}
          total={1248}
          currentPeriod={125}
          previousPeriod={100}
          {...defaultProps}
        />
      );

      expect(screen.getByText('1,248')).toBeInTheDocument();
    });

    it('should format very large numbers with k suffix', () => {
      render(
        <StatisticsCard
          title="Total Tips"
          icon={mockIcon}
          total={50400}
          currentPeriod={5000}
          previousPeriod={4500}
          {...defaultProps}
        />
      );

      expect(screen.getByText('50.4k')).toBeInTheDocument();
    });
  });

  describe('Accessibility_ShouldHaveProperAttributes_Always', () => {
    it('should have proper data-testid attributes', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={100}
          currentPeriod={10}
          previousPeriod={8}
          {...defaultProps}
        />
      );

      expect(container.querySelector('[data-testid="statistics-card"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="growth-indicator"]')).toBeInTheDocument();
    });

    it('should render as a clickable link', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={100}
          currentPeriod={10}
          previousPeriod={8}
          href="/admin/users"
          bgColor="green"
          period="month"
          statisticsType="amount"
        />
      );

      const link = container.querySelector('a[href="/admin/users"]');
      expect(link).toBeInTheDocument();
    });
  });
});
