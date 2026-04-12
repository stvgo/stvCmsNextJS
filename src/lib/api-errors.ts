/**
 * API Error Types
 * Custom error classes for better error handling
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network connection failed') {
    super(message, 0, 0);
    this.name = 'NetworkError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public validationErrors: Record<string, string[]>
  ) {
    super(message, 422, 422, { validationErrors });
    this.name = 'ValidationError';
  }
}

/**
 * Type guard for ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
