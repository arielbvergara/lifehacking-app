'use client';

import type { Period, StatisticsType } from '@/lib/types/admin-dashboard';

interface DashboardControlsProps {
  selectedPeriod: Period;
  selectedType: StatisticsType;
  onPeriodChange: (period: Period) => void;
  onTypeChange: (type: StatisticsType) => void;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

const STATISTICS_TYPES: { value: StatisticsType; label: string }[] = [
  { value: 'amount', label: 'Amount' },
  { value: 'percentage', label: 'Percentage' },
];

export function DashboardControls({
  selectedPeriod,
  selectedType,
  onPeriodChange,
  onTypeChange,
}: DashboardControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Period Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Period
        </label>
        <div 
          className="inline-flex rounded-lg border border-gray-300 bg-white p-1"
          role="group"
          aria-label="Period selection"
        >
          {PERIODS.map((period) => (
            <button
              key={period.value}
              type="button"
              onClick={() => onPeriodChange(period.value)}
              aria-pressed={selectedPeriod === period.value}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${
                  selectedPeriod === period.value
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              data-testid={`period-${period.value}`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Type Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Display As
        </label>
        <div 
          className="inline-flex rounded-lg border border-gray-300 bg-white p-1"
          role="group"
          aria-label="Statistics type selection"
        >
          {STATISTICS_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onTypeChange(type.value)}
              aria-pressed={selectedType === type.value}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${
                  selectedType === type.value
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              data-testid={`type-${type.value}`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
