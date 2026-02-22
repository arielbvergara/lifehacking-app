/**
 * Constants for admin dashboard management feature
 */

// API configuration
export const API_TIMEOUT_MS = 10000; // 10 seconds

// Error messages
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  GENERIC_ERROR: 'Something went wrong. Please try again later.',
  
  // Authentication errors
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  SESSION_EXPIRED: 'Session expired. Please log in again.',
  
  // Dashboard errors
  DASHBOARD_LOAD_FAILED: 'Failed to load statistics. Please try again.',
  
  // Tips management errors
  TIPS_LOAD_FAILED: 'Failed to load tips. Please try again.',
  TIP_NOT_FOUND: 'The requested tip was not found.',
  TIP_UPDATE_FAILED: 'Failed to update tip. Please check your input.',
  TIP_DELETE_FAILED: 'Failed to delete tip. Please try again.',
  
  // Categories management errors
  CATEGORIES_LOAD_FAILED: 'Failed to load categories. Please try again.',
  CATEGORY_NOT_FOUND: 'The requested category was not found.',
  CATEGORY_UPDATE_FAILED: 'Failed to update category. Please check your input.',
  CATEGORY_DELETE_FAILED: 'Failed to delete category. Please try again.',
  CATEGORY_NAME_EXISTS: 'A category with this name already exists.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  TIP_UPDATED: 'Tip updated successfully',
  TIP_DELETED: 'Tip deleted successfully',
  CATEGORY_UPDATED: 'Category updated successfully',
  CATEGORY_DELETED: 'Category deleted successfully',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const SEARCH_DEBOUNCE_MS = 300;
