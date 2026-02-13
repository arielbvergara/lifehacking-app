// API Response Types based on docs/api-schema.json

// Category Types
export interface CategoryImage {
  imageUrl: string | null;
  imageStoragePath: string | null;
  originalFileName: string | null;
  contentType: string | null;
  fileSizeBytes: number;
  uploadedAt: string; // ISO 8601 date-time
}

export interface Category {
  id: string; // UUID
  name: string;
  createdAt: string; // ISO 8601 date-time
  updatedAt: string | null; // ISO 8601 date-time
  image?: CategoryImage;
}

export interface CategoryListResponse {
  items: Category[];
}

// Tip Types
export interface TipImage {
  imageUrl: string | null;
  imageStoragePath: string | null;
  originalFileName: string | null;
  contentType: string | null;
  fileSizeBytes: number;
  uploadedAt: string; // ISO 8601 date-time
}

export interface TipSummary {
  id: string; // UUID
  title: string;
  description: string;
  categoryId: string; // UUID
  categoryName: string;
  tags: string[];
  videoUrl: string | null;
  createdAt: string; // ISO 8601 date-time
  image?: TipImage;
}

export interface TipStep {
  stepNumber: number;
  description: string;
}

export interface TipDetail extends TipSummary {
  steps: TipStep[];
  videoUrlId: string | null;
  updatedAt: string | null; // ISO 8601 date-time
}

export interface PaginationMetadata {
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface PagedTipsResponse {
  items: TipSummary[];
  metadata: PaginationMetadata;
}

// API Error Types
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  correlationId?: string;
  errors?: Record<string, string[]>;
}

// Enums
export enum TipSortField {
  CreatedAt = 0,
  UpdatedAt = 1,
  Title = 2,
}

export enum SortDirection {
  Ascending = 0,
  Descending = 1,
}
