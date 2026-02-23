/**
 * Constants for admin category creation feature
 */

import { MAX_IMAGE_SIZE_BYTES, ALLOWED_IMAGE_TYPES } from './image';

// Re-export shared image constants for backward compatibility
export { MAX_IMAGE_SIZE_BYTES, ALLOWED_IMAGE_TYPES };

// Validation constraints
export const CATEGORY_NAME_MIN_LENGTH = 2;
export const CATEGORY_NAME_MAX_LENGTH = 100;

// Error messages
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  GENERIC_ERROR: 'Something went wrong. Please try again later.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  
  // Category name validation
  NAME_REQUIRED: 'Category name is required',
  NAME_TOO_SHORT: `Category name must be at least ${CATEGORY_NAME_MIN_LENGTH} characters`,
  NAME_TOO_LONG: `Category name cannot exceed ${CATEGORY_NAME_MAX_LENGTH} characters`,
  
  // Image validation
  IMAGE_REQUIRED: 'Please select an image',
  IMAGE_TYPE_INVALID: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)',
  IMAGE_SIZE_EXCEEDED: `Image size cannot exceed ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB`,
  
  // API errors
  CATEGORY_EXISTS: (name: string) => `Category with name '${name}' already exists`,
} as const;
