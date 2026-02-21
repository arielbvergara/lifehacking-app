/**
 * TypeScript type definitions for admin dashboard management
 */

/**
 * Statistics for a single entity type (users, categories, or tips)
 */
export interface EntityStatistics {
  total: number;
  lastMonth: number;
  thisMonth: number;
}

/**
 * Dashboard statistics response from API
 */
export interface DashboardResponse {
  users: EntityStatistics;
  categories: EntityStatistics;
  tips: EntityStatistics;
}

/**
 * Image data transfer object
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
 * Request to update an existing tip
 */
export interface UpdateTipRequest {
  title: string;
  description: string;
  categoryId: string;
  steps: Array<{
    stepNumber: number;
    description: string;
  }>;
  tags: string[];
  videoUrl?: string | null;
  image?: TipImageDto;
}

/**
 * Request to update an existing category
 */
export interface UpdateCategoryRequest {
  name: string;
  image?: {
    imageUrl: string;
    imageStoragePath: string;
    originalFileName: string;
    contentType: string;
    fileSizeBytes: number;
    uploadedAt: string;
  };
}

/**
 * API error response
 */
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
