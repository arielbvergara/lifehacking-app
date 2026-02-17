/**
 * Constants for admin tip creation feature
 */

// Validation constraints (from API schema)
export const TIP_TITLE_MIN_LENGTH = 5;
export const TIP_TITLE_MAX_LENGTH = 200;
export const TIP_DESCRIPTION_MIN_LENGTH = 10;
export const TIP_DESCRIPTION_MAX_LENGTH = 2000;
export const TIP_STEP_DESCRIPTION_MIN_LENGTH = 10;
export const TIP_STEP_DESCRIPTION_MAX_LENGTH = 500;
export const TIP_TAG_MIN_LENGTH = 1;
export const TIP_TAG_MAX_LENGTH = 50;
export const TIP_MAX_TAGS = 10;
export const TIP_MIN_STEPS = 1;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

// API configuration
export const API_TIMEOUT_MS = 30000; // 30 seconds
export const GEMINI_TIMEOUT_MS = 60000; // 60 seconds for AI processing

// Video URL patterns
export const VIDEO_URL_PATTERNS = {
  YOUTUBE_WATCH: /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})$/,
  YOUTUBE_SHORTS: /^https:\/\/www\.youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})$/,
  INSTAGRAM: /^https:\/\/www\.instagram\.com\/p\/([a-zA-Z0-9_-]+)\/?$/,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  GENERIC_ERROR: 'Something went wrong. Please try again later.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  
  // Video URL validation
  VIDEO_URL_REQUIRED: 'Video URL is required',
  VIDEO_URL_INVALID: 'Please enter a valid YouTube or Instagram video URL',
  VIDEO_URL_FORMAT: 'URL must be from YouTube (watch/shorts) or Instagram',
  
  // Gemini API errors
  GEMINI_API_ERROR: 'Failed to generate tip content from video. Please try again.',
  GEMINI_INVALID_RESPONSE: 'Received invalid response from AI. Please try again.',
  GEMINI_API_KEY_MISSING: 'Gemini API key is not configured.',
  
  // Title validation
  TITLE_REQUIRED: 'Title is required',
  TITLE_TOO_SHORT: `Title must be at least ${TIP_TITLE_MIN_LENGTH} characters`,
  TITLE_TOO_LONG: `Title cannot exceed ${TIP_TITLE_MAX_LENGTH} characters`,
  
  // Description validation
  DESCRIPTION_REQUIRED: 'Description is required',
  DESCRIPTION_TOO_SHORT: `Description must be at least ${TIP_DESCRIPTION_MIN_LENGTH} characters`,
  DESCRIPTION_TOO_LONG: `Description cannot exceed ${TIP_DESCRIPTION_MAX_LENGTH} characters`,
  
  // Steps validation
  STEPS_REQUIRED: 'At least one step is required',
  STEP_DESCRIPTION_REQUIRED: 'Step description is required',
  STEP_DESCRIPTION_TOO_SHORT: `Step description must be at least ${TIP_STEP_DESCRIPTION_MIN_LENGTH} characters`,
  STEP_DESCRIPTION_TOO_LONG: `Step description cannot exceed ${TIP_STEP_DESCRIPTION_MAX_LENGTH} characters`,
  STEP_NUMBER_INVALID: 'Step number must be greater than 0',
  
  // Tags validation
  TAG_TOO_SHORT: `Tag must be at least ${TIP_TAG_MIN_LENGTH} character`,
  TAG_TOO_LONG: `Tag cannot exceed ${TIP_TAG_MAX_LENGTH} characters`,
  TOO_MANY_TAGS: `Maximum ${TIP_MAX_TAGS} tags allowed`,
  
  // Category validation
  CATEGORY_REQUIRED: 'Please select a category',
  CATEGORY_NOT_FOUND: 'Selected category does not exist',
  
  // Image validation
  IMAGE_REQUIRED: 'Please select an image',
  IMAGE_TYPE_INVALID: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)',
  IMAGE_SIZE_EXCEEDED: `Image size cannot exceed ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB`,
  
  // API errors
  TIP_CREATION_FAILED: 'Failed to create tip. Please try again.',
} as const;
