/**
 * Post Type Definitions
 * Centralized type definitions for posts and content blocks
 */

export type ContentBlockType = 'text' | 'code' | 'images' | 'urls';

export type PostStatus = 'public' | 'private';

export interface ContentBlock {
  id?: number;
  type: ContentBlockType;
  order: number;
  content: string;
  language?: string; // only for code blocks
}

export interface Post {
  id: number;
  title: string;
  user_id: string;
  content_blocks: ContentBlock[] | null;
  created_at: string;
  updated_at: string;
  status: PostStatus;
}

export interface CreatePost {
  title: string;
  user_id?: string;
  content_blocks?: ContentBlock[];
  status?: PostStatus;
}

export interface UpdatePost {
  id: number;
  title?: string;
  content_blocks?: ContentBlock[];
  status?: PostStatus;
}

/**
 * API Response Types
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    status: number;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Pagination Types
 */

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Query Types
 */

export interface PostQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}
