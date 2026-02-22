/**
 * Utility functions for dashboard statistics formatting and calculations
 */

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
 * Calculate growth indicator text based on thisMonth and lastMonth values
 * Returns text like "+12 this month" or "+5% growth"
 */
export function calculateGrowthText(thisMonth: number, lastMonth: number): {
  text: string;
  type: 'positive' | 'negative' | 'neutral';
} {
  const difference = thisMonth - lastMonth;
  
  // No change
  if (difference === 0) {
    return {
      text: 'No change',
      type: 'neutral',
    };
  }
  
  // Positive growth
  if (difference > 0) {
    // If lastMonth is 0 or very small, show absolute number
    if (lastMonth === 0 || lastMonth < 10) {
      return {
        text: `+${difference} this month`,
        type: 'positive',
      };
    }
    
    // Otherwise show percentage
    const percentage = ((difference / lastMonth) * 100).toFixed(0);
    return {
      text: `+${percentage}% growth`,
      type: 'positive',
    };
  }
  
  // Negative growth
  const absDifference = Math.abs(difference);
  if (lastMonth === 0 || lastMonth < 10) {
    return {
      text: `-${absDifference} this month`,
      type: 'negative',
    };
  }
  
  const percentage = ((absDifference / lastMonth) * 100).toFixed(0);
  return {
    text: `-${percentage}% decline`,
    type: 'negative',
  };
}
