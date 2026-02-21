'use client';

import { StatisticsCard } from './statistics-card';
import type { DashboardResponse } from '@/lib/types/admin-dashboard';

interface DashboardGridProps {
  statistics: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function DashboardGrid({
  statistics,
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
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

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
        thisMonth={statistics?.tips.thisMonth ?? 0}
        lastMonth={statistics?.tips.lastMonth ?? 0}
        loading={loading}
        bgColor="green"
        href="/admin/tips"
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
        thisMonth={statistics?.users.thisMonth ?? 0}
        lastMonth={statistics?.users.lastMonth ?? 0}
        loading={loading}
        bgColor="yellow"
        href="/admin/users"
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
        thisMonth={statistics?.categories.thisMonth ?? 0}
        lastMonth={statistics?.categories.lastMonth ?? 0}
        loading={loading}
        bgColor="blue"
        href="/admin/categories"
      />
    </div>
  );
}
