/**
 * Utility functions for dashboard statistics formatting and calculations
 */

import type { Period } from '@/lib/types/admin-dashboard';

/**
 * Calculate percentage change between current and previous values
 * Returns formatted percentage string like "+15%" or "-8%"
 * 
 * Special case: When previous is 0, returns "+100%" if current > 0, otherwise "0%"
 * This avoids division by zero and provides a meaningful indicator for growth from zero
 */
export function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%';
  }
  
  const change = ((current - previous) / previous) * 100;
  const formatted = change.toFixed(1);
  
  // Remove trailing .0
  const cleanFormatted = formatted.endsWith('.0') 
    ? formatted.slice(0, -2) 
    : formatted;
  
  return change > 0 ? `+${cleanFormatted}%` : `${cleanFormatted}%`;
}

/**
 * Get period label for display
 */
export function getPeriodLabel(period: Period): string {
  const labels: Record<Period, string> = {
    day: 'today',
    week: 'this week',
    month: 'this month',
    year: 'this year',
  };
  return labels[period];
}

/**
 * Format a number with thousands separator and optional "k" suffix
 * Examples:
 * - 1248 → "1,248"
 * - 50400 → "50.4k"
 * - 18 → "18"
 */
export function formatStatNumber(num: number): string {
  if (num >= 10000) {
    // For numbers >= 10k, show with "k" suffix
    const thousands = num / 1000;
    // Remove trailing .0
    const formatted = thousands % 1 === 0 
      ? thousands.toFixed(0) 
      : thousands.toFixed(1);
    return `${formatted}k`;
  }
  
  // For numbers < 10k, show with comma separator
  return num.toLocaleString();
}

/**
 * Calculate growth indicator text based on current and previous period values
 * 
 * @param current - Current period value
 * @param previous - Previous period value
 * @param period - Time period (day, week, month, year)
 * @param displayAsPercentage - If true, returns only percentage change; if false, returns contextual text
 * 
 * @returns Object with text (e.g., "+12 this month", "+5%", "No change") and type (positive/negative/neutral)
 * 
 * Examples:
 * - calculateGrowthText(105, 100, 'month', false) → { text: "+5% growth", type: "positive" }
 * - calculateGrowthText(105, 100, 'month', true) → { text: "+5%", type: "positive" }
 * - calculateGrowthText(12, 0, 'week', false) → { text: "+12 this week", type: "positive" }
 */
export function calculateGrowthText(
  current: number, 
  previous: number, 
  period: Period,
  displayAsPercentage: boolean = false
): {
  text: string;
  type: 'positive' | 'negative' | 'neutral';
} {
  const difference = current - previous;
  
  // No change
  if (difference === 0) {
    return {
      text: 'No change',
      type: 'neutral',
    };
  }
  
  const periodLabel = getPeriodLabel(period);
  
  // If displaying as percentage, show the percentage change
  if (displayAsPercentage) {
    const percentageChange = calculatePercentageChange(current, previous);
    return {
      text: percentageChange,
      type: difference > 0 ? 'positive' : 'negative',
    };
  }
  
  // Positive growth
  if (difference > 0) {
    // If previous is 0 or very small, show absolute number
    if (previous === 0 || previous < 10) {
      return {
        text: `+${difference} ${periodLabel}`,
        type: 'positive',
      };
    }
    
    // Otherwise show percentage
    const percentage = ((difference / previous) * 100).toFixed(0);
    return {
      text: `+${percentage}% growth`,
      type: 'positive',
    };
  }
  
  // Negative growth
  const absDifference = Math.abs(difference);
  if (previous === 0 || previous < 10) {
    return {
      text: `-${absDifference} ${periodLabel}`,
      type: 'negative',
    };
  }
  
  const percentage = ((absDifference / previous) * 100).toFixed(0);
  return {
    text: `-${percentage}% decline`,
    type: 'negative',
  };
}
