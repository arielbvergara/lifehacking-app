import { render, screen } from '@testing-library/react';
import { StatisticsCard } from './statistics-card';

describe('StatisticsCard', () => {
  const mockIcon = <span className="material-icons-round">people</span>;
  const defaultProps = {
    bgColor: 'green' as const,
    href: '/admin/users',
  };

  describe('Display Completeness', () => {
    it('should display total value and growth indicator', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={1248}
          thisMonth={12}
          lastMonth={8}
          {...defaultProps}
        />
      );

      // Check that total is displayed
      expect(screen.getByText('1,248')).toBeInTheDocument();
      
      // Check that growth indicator is displayed
      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      expect(growthIndicator).toBeInTheDocument();
    });

    it('should display title and icon', () => {
      render(
        <StatisticsCard
          title="Total Tips"
          icon={mockIcon}
          total={500}
          thisMonth={50}
          lastMonth={45}
          {...defaultProps}
        />
      );

      expect(screen.getByText('Total Tips')).toBeInTheDocument();
      expect(screen.getByText('people')).toBeInTheDocument();
    });
  });

  describe('Positive Growth Indicator', () => {
    it('should display positive growth in green with trending up icon when thisMonth > lastMonth', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={100}
          thisMonth={12}
          lastMonth={8}
          {...defaultProps}
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      expect(growthIndicator).toBeInTheDocument();
      
      // Check for green color class
      const greenText = growthIndicator?.querySelector('.text-green-600');
      expect(greenText).toBeInTheDocument();
      
      // Check for trending up icon
      const trendingIcon = growthIndicator?.querySelector('.material-icons-round');
      expect(trendingIcon?.textContent).toBe('trending_up');
      
      // Check growth percentage calculation: ((12 - 8) / 8) * 100 = 50%
      expect(growthIndicator?.textContent).toContain('+4 this month');
    });

    it('should calculate growth percentage correctly', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Categories"
          icon={mockIcon}
          total={100}
          thisMonth={20}
          lastMonth={10}
          {...defaultProps}
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      // ((20 - 10) / 10) * 100 = 100%
      expect(growthIndicator?.textContent).toContain('+100% growth');
    });
  });

  describe('Negative Growth Indicator', () => {
    it('should display negative growth in red with trending down icon when thisMonth < lastMonth', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={100}
          thisMonth={6}
          lastMonth={10}
          {...defaultProps}
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      expect(growthIndicator).toBeInTheDocument();
      
      // Check for red color class
      const redText = growthIndicator?.querySelector('.text-red-600');
      expect(redText).toBeInTheDocument();
      
      // Check for trending down icon
      const trendingIcon = growthIndicator?.querySelector('.material-icons-round');
      expect(trendingIcon?.textContent).toBe('trending_down');
      
      // Check growth percentage calculation: ((6 - 10) / 10) * 100 = -40%
      expect(growthIndicator?.textContent).toContain('-40% decline');
    });
  });

  describe('Neutral Growth Indicator', () => {
    it('should display neutral indicator when thisMonth equals lastMonth', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Categories"
          icon={mockIcon}
          total={20}
          thisMonth={5}
          lastMonth={5}
          {...defaultProps}
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      expect(growthIndicator).toBeInTheDocument();
      
      // Check for gray color class
      const grayText = growthIndicator?.querySelector('.text-gray-500');
      expect(grayText).toBeInTheDocument();
      
      // Check for neutral icon
      const neutralIcon = growthIndicator?.querySelector('.material-icons-round');
      expect(neutralIcon?.textContent).toBe('remove');
      
      // Check for "No change" text
      expect(growthIndicator?.textContent).toContain('No change');
    });
  });

  describe('Edge Case: lastMonth is 0', () => {
    it('should display growth text when lastMonth is 0 and thisMonth > 0', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={10}
          thisMonth={10}
          lastMonth={0}
          {...defaultProps}
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      expect(growthIndicator).toBeInTheDocument();
      
      // When lastMonth is 0, growth is calculated as 100% of thisMonth
      expect(growthIndicator?.textContent).toContain('10 this month');
    });

    it('should display neutral indicator when both lastMonth and thisMonth are 0', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={0}
          thisMonth={0}
          lastMonth={0}
          {...defaultProps}
        />
      );

      const growthIndicator = container.querySelector('[data-testid="growth-indicator"]');
      expect(growthIndicator).toBeInTheDocument();
      
      // Check for neutral indicator
      const grayText = growthIndicator?.querySelector('.text-gray-500');
      expect(grayText).toBeInTheDocument();
      expect(growthIndicator?.textContent).toContain('No change');
    });
  });

  describe('Loading State', () => {
    it('should display skeleton loading state when loading prop is true', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={100}
          thisMonth={10}
          lastMonth={8}
          loading={true}
          {...defaultProps}
        />
      );

      // Check for skeleton animation class
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
      
      // Verify actual content is not displayed
      expect(screen.queryByText('Total Users')).not.toBeInTheDocument();
      expect(screen.queryByText('100')).not.toBeInTheDocument();
    });

    it('should display actual content when loading prop is false', () => {
      render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={100}
          thisMonth={10}
          lastMonth={8}
          loading={false}
          {...defaultProps}
        />
      );

      // Verify actual content is displayed
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    it('should format large numbers with commas', () => {
      render(
        <StatisticsCard
          title="Total Tips"
          icon={mockIcon}
          total={1248}
          thisMonth={125}
          lastMonth={100}
          {...defaultProps}
        />
      );

      // Check that total is formatted with comma
      expect(screen.getByText('1,248')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper data-testid attributes', () => {
      const { container } = render(
        <StatisticsCard
          title="Total Users"
          icon={mockIcon}
          total={100}
          thisMonth={10}
          lastMonth={8}
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
          thisMonth={10}
          lastMonth={8}
          href="/admin/users"
          bgColor="green"
        />
      );

      const link = container.querySelector('a[href="/admin/users"]');
      expect(link).toBeInTheDocument();
    });
  });
});
