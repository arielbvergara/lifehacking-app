'use client';

import { StatisticsCard } from './statistics-card';
import type { DashboardResponse, Period, StatisticsType } from '@/lib/types/admin-dashboard';

interface DashboardGridProps {
  statistics: DashboardResponse | null;
  period: Period;
  statisticsType: StatisticsType;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function DashboardGrid({
  statistics,
  period,
  statisticsType,
  loading,
  error,
  onRetry,
}: DashboardGridProps) {
  // Display error message with retry button
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="mb-4">
          <span className="material-icons-round text-red-500 text-5xl">
            error_outline
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Statistics
        </h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  // Helper function to get current and previous values based on selected period
  const getPeriodValues = (stats: typeof statistics) => {
    const defaultValues = {
      tips: { current: 0, previous: 0 },
      categories: { current: 0, previous: 0 },
      users: { current: 0, previous: 0 },
    };
    
    if (!stats) return defaultValues;
    
    const periodMap = {
      day: { current: 'thisDay', previous: 'lastDay' },
      week: { current: 'thisWeek', previous: 'lastWeek' },
      month: { current: 'thisMonth', previous: 'lastMonth' },
      year: { current: 'thisYear', previous: 'lastYear' },
    } as const;
    
    const keys = periodMap[period];
    return {
      tips: {
        current: stats.tips[keys.current] ?? 0,
        previous: stats.tips[keys.previous] ?? 0,
      },
      categories: {
        current: stats.categories[keys.current] ?? 0,
        previous: stats.categories[keys.previous] ?? 0,
      },
      users: {
        current: stats.users[keys.current] ?? 0,
        previous: stats.users[keys.previous] ?? 0,
      },
    };
  };

  const periodValues = getPeriodValues(statistics);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Tips Statistics Card */}
      <StatisticsCard
        title="Total Tips"
        icon={
          <span className="material-icons-round">
            lightbulb
          </span>
        }
        total={statistics?.tips.total ?? 0}
        currentPeriod={periodValues.tips?.current ?? 0}
        previousPeriod={periodValues.tips?.previous ?? 0}
        period={period}
        statisticsType={statisticsType}
        loading={loading}
        bgColor="green"
        href="/admin/tips"
      />

      {/* Categories Statistics Card */}
      <StatisticsCard
        title="Active Categories"
        icon={
          <span className="material-icons-round">
            account_tree
          </span>
        }
        total={statistics?.categories.total ?? 0}
        currentPeriod={periodValues.categories?.current ?? 0}
        previousPeriod={periodValues.categories?.previous ?? 0}
        period={period}
        statisticsType={statisticsType}
        loading={loading}
        bgColor="blue"
        href="/admin/categories"
      />

      {/* Users Statistics Card */}
      <StatisticsCard
        title="Happy Users"
        icon={
          <span className="material-icons-round">
            sentiment_satisfied_alt
          </span>
        }
        total={statistics?.users.total ?? 0}
        currentPeriod={periodValues.users?.current ?? 0}
        previousPeriod={periodValues.users?.previous ?? 0}
        period={period}
        statisticsType={statisticsType}
        loading={loading}
        bgColor="yellow"
        href="/admin/users"
      />
    </div>
  );
}
