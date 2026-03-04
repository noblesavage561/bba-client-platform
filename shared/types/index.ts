/**
 * Shared TypeScript types for BBA Client Platform
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiError {
  message: string;
  code: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
