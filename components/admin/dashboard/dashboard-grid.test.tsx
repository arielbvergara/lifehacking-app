import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { DashboardGrid } from './dashboard-grid';
import type { DashboardResponse } from '@/lib/types/admin-dashboard';

describe('DashboardGrid', () => {
  const mockStatistics: DashboardResponse = {
    users: { total: 100, thisMonth: 10, lastMonth: 8 },
    categories: { total: 20, thisMonth: 2, lastMonth: 2 },
    tips: { total: 500, thisMonth: 50, lastMonth: 45 },
  };

  const mockOnRetry = vi.fn();

  beforeEach(() => {
    mockOnRetry.mockClear();
  });

  it('renders three statistics cards when data is loaded', () => {
    const { container } = render(
      <DashboardGrid
        statistics={mockStatistics}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
      />
    );

    const cards = container.querySelectorAll('[data-testid="statistics-card"]');
    expect(cards).toHaveLength(3);
  });

  it('displays loading skeletons when loading is true', () => {
    const { container } = render(
      <DashboardGrid
        statistics={null}
        loading={true}
        error={null}
        onRetry={mockOnRetry}
      />
    );

    // Loading skeletons have animate-pulse class
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays error message when error is present', () => {
    render(
      <DashboardGrid
        statistics={null}
        loading={false}
        error="Network error. Please check your connection."
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText('Failed to Load Statistics')).toBeInTheDocument();
    expect(screen.getByText('Network error. Please check your connection.')).toBeInTheDocument();
  });

  it('displays retry button when error is present', () => {
    render(
      <DashboardGrid
        statistics={null}
        loading={false}
        error="Network error"
        onRetry={mockOnRetry}
      />
    );

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    render(
      <DashboardGrid
        statistics={null}
        loading={false}
        error="Network error"
        onRetry={mockOnRetry}
      />
    );

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('displays correct titles for each card', () => {
    render(
      <DashboardGrid
        statistics={mockStatistics}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText('Total Tips')).toBeInTheDocument();
    expect(screen.getByText('Happy Users')).toBeInTheDocument();
    expect(screen.getByText('Active Categories')).toBeInTheDocument();
  });

  it('uses responsive grid layout', () => {
    const { container } = render(
      <DashboardGrid
        statistics={mockStatistics}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
      />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-3');
  });

  it('handles null statistics gracefully when not loading', () => {
    const { container } = render(
      <DashboardGrid
        statistics={null}
        loading={false}
        error={null}
        onRetry={mockOnRetry}
      />
    );

    const cards = container.querySelectorAll('[data-testid="statistics-card"]');
    expect(cards).toHaveLength(3);
    
    // Should display 0 for all values (3 cards × 2 occurrences per card = 6 total)
    // Each card shows: total (0), thisMonth (0), and displays "0 this month"
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });
});
