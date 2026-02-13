import { TipSummary, Category } from '@/lib/types/api';

/**
 * SEO Text Generation Utilities
 * 
 * Provides functions for generating SEO-optimized text content including
 * image alt text, meta descriptions, and other SEO-related text.
 */

/**
 * Generates descriptive alt text for tip images
 * 
 * @param tip - The tip summary object
 * @returns SEO-optimized alt text
 */
export function generateTipImageAlt(tip: TipSummary): string {
  return `${tip.title} - ${tip.categoryName} life hack with step-by-step guide`;
}

/**
 * Generates descriptive alt text for category images
 * 
 * @param category - The category object
 * @returns SEO-optimized alt text
 */
export function generateCategoryImageAlt(category: Category): string {
  return `${category.name} category - Browse life hacks and tips`;
}

/**
 * Generates meta description for tip detail pages
 * 
 * @param tip - The tip summary object
 * @param maxLength - Maximum length of description (default: 160)
 * @returns SEO-optimized meta description
 */
export function generateTipMetaDescription(tip: TipSummary, maxLength: number = 160): string {
  const description = tip.description;
  
  if (description.length <= maxLength) {
    return description;
  }
  
  // Truncate at word boundary
  const truncated = description.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? `${truncated.substring(0, lastSpace)}...`
    : `${truncated}...`;
}

/**
 * Generates meta description for category pages
 * 
 * @param categoryName - The category name
 * @param tipCount - Number of tips in the category
 * @returns SEO-optimized meta description
 */
export function generateCategoryMetaDescription(categoryName: string, tipCount: number): string {
  return `Discover ${tipCount} practical ${categoryName.toLowerCase()} life hacks and tips. Simple tricks to make your daily life easier.`;
}

/**
 * Generates page title with site name
 * 
 * @param pageTitle - The page-specific title
 * @param includeSiteName - Whether to include site name (default: true)
 * @returns Complete page title
 */
export function generatePageTitle(pageTitle: string, includeSiteName: boolean = true): string {
  return includeSiteName ? `${pageTitle} | LifeHackBuddy` : pageTitle;
}
