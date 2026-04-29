import type { CreatePost, Post, UpdatePost } from "@/types/post";
import { config } from "@/config";
import { logger } from "@/lib/logger";
import {
  ApiError,
  NetworkError,
  NotFoundError,
  ValidationError,
} from "@/lib/api-errors";
import { validateCreatePost, validateUpdatePost } from "@/validators/post";

/**
 * API Client with proper error handling, logging, and type safety
 */

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');

  // Handle no content responses
  if (response.status === 204 || response.status === 205) {
    return null as T;
  }

  let data: unknown;

  try {
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    }
  } catch {
    data = null;
  }

  // Handle error status codes
  if (!response.ok) {
    logger.api(`Request failed: ${response.status}`, {
      url: response.url,
      status: response.status,
      data,
    });

    switch (response.status) {
      case 404:
        throw new NotFoundError('Resource');
      case 401:
        throw new Error('Unauthorized');
      case 422:
        throw new ValidationError(
          'Validation failed',
          data instanceof Object ? (data as Record<string, string[]>) : {}
        );
      case 500:
        throw new ApiError('Internal server error', response.status, 500, data);
      default:
        throw new ApiError(
          data instanceof Object && 'message' in data
            ? String(data.message)
            : `Request failed with status ${response.status}`,
          response.status,
          response.status,
          data
        );
    }
  }

  logger.api(`Request successful: ${response.status}`, {
    url: response.url,
    status: response.status,
  });

  return data as T;
}

/**
 * Build auth headers for server-side requests by forwarding the Auth.js session cookie.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {}
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      
      // Try to find any auth session cookie (Auth.js v5 uses various names)
      const allCookies = cookieStore.getAll()
      const sessionCookie = allCookies.find(
        (c) => c.name.includes('session-token') || c.name.includes('authjs')
      )
      
      if (sessionCookie) {
        headers['Cookie'] = `${sessionCookie.name}=${sessionCookie.value}`
        headers['Authorization'] = `Bearer ${sessionCookie.value}`
        if (process.env.DEBUG === 'true') {
          console.log(`[AUTH] Forwarding cookie: ${sessionCookie.name}`)
        }
      } else if (process.env.DEBUG === 'true') {
        console.log('[AUTH] No session cookie found. Available:', allCookies.map(c => c.name))
      }
    } catch (e) {
      if (process.env.DEBUG === 'true') {
        console.log('[AUTH] Failed to read cookies:', e)
      }
    }
  }
  return headers
}

/**
 * Fetch wrapper with error handling, timeout, and auth forwarding.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

  const authHeaders = await getAuthHeaders();
  const mergedHeaders = new Headers(options.headers);
  Object.entries(authHeaders).forEach(([key, value]) => {
    mergedHeaders.set(key, value);
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers: mergedHeaders,
      credentials: 'include',
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        `Request timeout after ${config.api.timeout}ms`,
        408,
        408
      );
    }
    if (error instanceof Error && error.name === 'TypeError') {
      throw new NetworkError();
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Create a new post
 */
export async function createPost(post: CreatePost): Promise<Post> {
  // Validate input
  const validation = validateCreatePost(post);
  if (!validation.success) {
    throw new ValidationError(
      'Invalid post data',
      validation.error.flatten().fieldErrors
    );
  }

  logger.api(`Creating post: ${post.title}`);

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/post/create`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    }
  );

  return handleResponse<Post>(response);
}

/**
 * Search posts by query term
 */
export async function searchPosts(query: string): Promise<Post[]> {
  logger.api(`Searching posts with query: ${query}`);

  try {
    const response = await fetchWithTimeout(
      `${config.api.baseUrl}/post/getPost/${encodeURIComponent(query)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await handleResponse<unknown>(response);

    // Validate response is an array
    if (!Array.isArray(data)) {
      logger.warn('Unexpected API response format for searchPosts, expected array');
      return [];
    }

    return data as Post[];
  } catch (error) {
    logger.error('Failed to search posts:', error);
    return [];
  }
}

/**
 * Get all posts
 */
export async function getPosts(): Promise<Post[]> {
  logger.api('Fetching all posts');

  try {
    const response = await fetchWithTimeout(
      `${config.api.baseUrl}/post/getAll`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await handleResponse<unknown>(response);

    // Validate response is an array
    if (!Array.isArray(data)) {
      logger.warn('Unexpected API response format for getPosts, expected array');
      return [];
    }

    return data as Post[];
  } catch (error) {
    logger.error('Failed to fetch posts:', error);
    return [];
  }
}

/**
 * Update an existing post
 */
export async function updatePost(post: UpdatePost): Promise<Post> {
  // Validate input
  const validation = validateUpdatePost(post);
  if (!validation.success) {
    throw new ValidationError(
      'Invalid post data',
      validation.error.flatten().fieldErrors
    );
  }

  logger.api(`Updating post: ${post.id}`);

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/post/update`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    }
  );

  return handleResponse<Post>(response);
}

/**
 * Get a single post by ID
 */
export async function getPostById(id: string): Promise<Post | null> {
  logger.api(`Fetching post: ${id}`);

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/post/getPost/${id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.status === 404) {
    return null;
  }

  return handleResponse<Post | null>(response);
}

/**
 * Delete a post by ID
 */
export async function deletePost(id: string): Promise<void> {
  logger.api(`Deleting post: ${id}`);

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/post/delete/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return handleResponse<void>(response);
}

/**
 * Upload an image file
 */
export async function uploadImage(file: File): Promise<string> {
  logger.api(`Uploading image: ${file.name}`);

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/post/uploadImage`,
    {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header for FormData, browser will set it with boundary
    }
  );

  const data = await handleResponse<{ filename: string }>(response);
  return data.filename;
}

/**
 * Generate code using AI
 */
export async function generateCodeAI(prompt: string): Promise<string> {
  logger.api(`Generating AI code for prompt: ${prompt}`);

  const response = await fetchWithTimeout('/api/post/autoCompleteAI', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code_ai: prompt }),
  })

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status, response.status)
  }

  const raw = await response.text()
  let result: string
  try {
    result = JSON.parse(raw) as string
  } catch {
    result = raw
  }

  // Strip markdown code fences if present
  return result.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim()
}

/**
 * Generate text content using AI
 */
export async function generateTextAI(prompt: string): Promise<string> {
  logger.api(`Generating AI text for prompt: ${prompt}`);

  const response = await fetchWithTimeout('/api/gen-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text_ai: prompt }),
  })

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status, response.status)
  }

  const raw = await response.text()
  try {
    return JSON.parse(raw) as string
  } catch {
    return raw
  }
}

/**
 * Get the full URL for an image
 */
export function getImageUrl(filename: string): string {
  if (!filename) {
    return '';
  }

  // If already a full URL, return as-is
  if (filename.startsWith('http')) {
    return filename;
  }

  // Construct the full URL to the backend
  return `${config.api.imageBaseUrl}/post/image/${filename}`;
}
