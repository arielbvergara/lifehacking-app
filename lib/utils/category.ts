/**
 * Maps category names to their corresponding emoji icons.
 * Provides a consistent icon for each category across the application.
 */
const CATEGORY_ICONS: Record<string, string> = {
  'Kitchen': '🍳',
  'Cleaning': '🧹',
  'Tech Help': '💻',
  'DIY Repair': '🔧',
  'Wellness': '🧘',
  'Automotive': '🚗',
  'Fashion': '👗',
  'Gardening': '🌱',
  'Finance': '💰',
  'Organization': '📋',
  'Cooking': '🍳',
  'Home': '🏠',
  'Travel': '✈️',
  'Fitness': '💪',
  'Beauty': '💄',
  'Pets': '🐾',
  'Parenting': '👶',
  'Education': '📚',
  'Career': '💼',
  'Relationships': '❤️',
};

/**
 * Default icon for categories without a specific mapping.
 */
const DEFAULT_CATEGORY_ICON = '📌';

/**
 * Gets the icon for a given category name.
 * Returns a consistent icon for known categories, or a default icon for unknown categories.
 * 
 * @param categoryName - The name of the category
 * @returns The emoji icon for the category
 * 
 * @example
 * getCategoryIcon("Kitchen") // "🍳"
 * getCategoryIcon("Unknown Category") // "📌"
 * getCategoryIcon("kitchen") // "📌" (case-sensitive)
 */
export function getCategoryIcon(categoryName: string): string {
  // Use hasOwnProperty to avoid prototype pollution issues
  if (Object.prototype.hasOwnProperty.call(CATEGORY_ICONS, categoryName)) {
    return CATEGORY_ICONS[categoryName];
  }
  return DEFAULT_CATEGORY_ICON;
}

/**
 * Gets all available category icons.
 * Useful for testing and documentation purposes.
 * 
 * @returns A readonly record of category names to icons
 */
export function getAllCategoryIcons(): Readonly<Record<string, string>> {
  return CATEGORY_ICONS;
}

/**
 * Formats a tip count for display.
 * 
 * @param count - The number of tips (must be non-negative)
 * @returns Formatted string in the format "{count} tips"
 * 
 * @example
 * formatTipCount(0) // "0 tips"
 * formatTipCount(1) // "1 tips"
 * formatTipCount(42) // "42 tips"
 */
export function formatTipCount(count: number): string {
  return `${count} tips`;
}
