/**
 * TypeScript type definitions for admin tip creation
 */

/**
 * Tip image metadata from S3 upload
 */
export interface TipImageDto {
  imageUrl: string;
  imageStoragePath: string;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

/**
 * Tip step structure
 */
export interface TipStepRequest {
  stepNumber: number;
  description: string;
}

/**
 * Request to create a new tip
 */
export interface CreateTipRequest {
  title: string;
  description: string;
  steps: TipStepRequest[];
  categoryId: string;
  tags: string[];
  videoUrl: string | null;
  image: TipImageDto;
}

/**
 * Tip response from API
 */
export interface TipDetailResponse {
  id: string;
  title: string;
  description: string;
  steps: TipStepRequest[];
  categoryId: string;
  categoryName: string;
  tags: string[];
  videoUrl: string | null;
  videoUrlId: string | null;
  createdAt: string;
  updatedAt: string | null;
  image: TipImageDto;
}

/**
 * Gemini API response structure
 */
export interface GeminiTipContent {
  title: string;
  description: string;
  steps: TipStepRequest[];
  tags: string[];
  videoUrl: string;
}

/**
 * Category response from API
 */
export interface CategoryResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * API error response
 */
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Form validation errors
 */
export interface TipValidationErrors {
  videoUrl?: string;
  title?: string;
  description?: string;
  steps?: string;
  tags?: string;
  categoryId?: string;
  image?: string;
  gemini?: string;
}

/**
 * Video URL validation result
 */
export interface VideoUrlValidation {
  isValid: boolean;
  platform?: 'youtube' | 'instagram';
  videoId?: string;
  error?: string;
}
