/**
 * TypeScript type definitions for admin category API
 */

/**
 * Category image metadata from S3 upload
 */
export interface CategoryImageDto {
  imageUrl: string;
  imageStoragePath: string;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

/**
 * Request to create a new category
 */
export interface CreateCategoryRequest {
  name: string;
  image: CategoryImageDto;
}

/**
 * Category response from API
 */
export interface CategoryResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  image: CategoryImageDto;
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
export interface ValidationErrors {
  categoryName?: string;
  image?: string;
}
