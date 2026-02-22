'use client';

import Link from 'next/link';
import { formatStatNumber, calculateGrowthText, calculatePercentageChange } from '@/lib/utils/dashboard';
import type { Period, StatisticsType } from '@/lib/types/admin-dashboard';

interface StatisticsCardProps {
  title: string;
  icon: React.ReactNode;
  total: number;
  currentPeriod: number;
  previousPeriod: number;
  period: Period;
  statisticsType: StatisticsType;
  loading?: boolean;
  bgColor: 'green' | 'yellow' | 'blue';
  href: string;
}

export function StatisticsCard({
  title,
  icon,
  total,
  currentPeriod,
  previousPeriod,
  period,
  statisticsType,
  loading = false,
  bgColor,
  href,
}: StatisticsCardProps) {
  // Show skeleton loading state
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl shadow-md p-6 animate-pulse bg-gray-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded w-32 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-28"></div>
      </div>
    );
  }

  // Calculate growth
  const growth = calculateGrowthText(
    currentPeriod, 
    previousPeriod, 
    period,
    statisticsType === 'percentage'
  );

  // Format the display value
  const formattedTotal = formatStatNumber(total);

  // Background color classes
  const bgColorClasses = {
    green: 'bg-green-50',
    yellow: 'bg-amber-50',
    blue: 'bg-blue-50',
  };

  // Icon color classes
  const iconColorClasses = {
    green: 'text-green-600',
    yellow: 'text-amber-600',
    blue: 'text-blue-600',
  };

  // Growth color classes
  const growthColorClasses = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-500',
  };

  // Decorative circle color classes
  const circleColorClasses = {
    green: 'bg-green-200/30',
    yellow: 'bg-amber-200/30',
    blue: 'bg-blue-200/30',
  };

  return (
    <Link 
      href={href}
      className={`block relative overflow-hidden rounded-2xl shadow-md p-6 ${bgColorClasses[bgColor]} hover:shadow-lg transition-shadow cursor-pointer`}
      data-testid="statistics-card"
    >
      {/* Decorative background circle */}
      <div 
        className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${circleColorClasses[bgColor]}`}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header with icon and title */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`text-2xl ${iconColorClasses[bgColor]}`}>
            {icon}
          </div>
          <h3 className="text-sm font-medium text-gray-600 leading-tight">{title}</h3>
        </div>

        {/* Display total or percentage based on mode */}
        <div className="mb-3">
          {statisticsType === 'percentage' ? (
            <>
              <p className="text-4xl font-bold text-gray-900">
                {calculatePercentageChange(currentPeriod, previousPeriod)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total: {formattedTotal}</p>
            </>
          ) : (
            <p className="text-4xl font-bold text-gray-900">{formattedTotal}</p>
          )}
        </div>

        {/* Growth indicator */}
        <div className="flex items-center gap-1" data-testid="growth-indicator">
          {growth.type === 'positive' && (
            <span className="material-icons-round text-green-600 text-base">
              trending_up
            </span>
          )}
          
          {growth.type === 'negative' && (
            <span className="material-icons-round text-red-600 text-base">
              trending_down
            </span>
          )}
          
          {growth.type === 'neutral' && (
            <span className="material-icons-round text-gray-500 text-base">
              remove
            </span>
          )}
          
          <span className={`text-sm font-medium ${growthColorClasses[growth.type]}`}>
            {growth.text}
          </span>
        </div>
      </div>
    </Link>
  );
}
