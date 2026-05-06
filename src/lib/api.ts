import type { CreatePost, Post, UpdatePost, Notification } from "@/types/post";
import type { Project } from "@/types/project";
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
 * Build auth headers: client reads from localStorage, server reads from cookies.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {}

  if (typeof window !== 'undefined') {
    // Client-side: read our backend JWT from localStorage
    const token = localStorage.getItem('stv_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  } else {
    // Server-side: try to read from cookies (for SSR if needed)
    try {
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      const tokenCookie = cookieStore.get('stv_token')
      if (tokenCookie) {
        headers['Authorization'] = `Bearer ${tokenCookie.value}`
      }
    } catch {
      // ignore
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
 * @param options.requireAuth - If false, uses the public endpoint (no auth required)
 */
export async function getPosts(options?: { requireAuth?: boolean }): Promise<Post[]> {
  const requireAuth = options?.requireAuth ?? true;
  logger.api('Fetching all posts');

  const endpoint = requireAuth
    ? `${config.api.baseUrl}/post/getAll`
    : `${config.api.baseUrl}/post/getPublic`;

  try {
    const response = await fetchWithTimeout(
      endpoint,
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
 * @param options.requireAuth - If false, uses the public endpoint (no auth required)
 */
export async function getPostById(id: string, options?: { requireAuth?: boolean }): Promise<Post | null> {
  const requireAuth = options?.requireAuth ?? true;
  logger.api(`Fetching post: ${id}`);

  const endpoint = requireAuth
    ? `${config.api.baseUrl}/post/getPost/${id}`
    : `${config.api.baseUrl}/post/getPublic/${id}`;

  const response = await fetchWithTimeout(
    endpoint,
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
/**
 * Delete a post by ID (admin only)
 */
export async function deletePost(id: string): Promise<void> {
  logger.api(`Deleting post (admin): ${id}`);

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/admin/post/delete/${id}`,
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
 * Parse AI response text: handles plain text, JSON string, or JSON object with a content key.
 */
function parseAIResponse(raw: string): string {
  console.log('[parseAIResponse] raw input (first 300):', raw.substring(0, 300))
  try {
    const parsed = JSON.parse(raw)
    console.log('[parseAIResponse] JSON parsed, type:', typeof parsed, 'keys:', Object.keys(parsed))
    if (typeof parsed === 'string') {
      console.log('[parseAIResponse] returning parsed string (first 200):', parsed.substring(0, 200))
      return parsed
    }
    if (parsed && typeof parsed === 'object') {
      const contentKeys = ['content', 'html', 'text', 'result', 'data', 'response', 'message', 'output']
      for (const key of contentKeys) {
        if (key in parsed && typeof parsed[key] === 'string' && parsed[key].trim()) {
          console.log(`[parseAIResponse] found content key "${key}" (first 200):`, (parsed[key] as string).substring(0, 200))
          return parsed[key]
        }
      }
      for (const value of Object.values(parsed)) {
        if (typeof value === 'string' && value.trim()) {
          console.log('[parseAIResponse] fallback to first string value (first 200):', value.substring(0, 200))
          return value
        }
      }
    }
    console.log('[parseAIResponse] no match, returning String(parsed)')
    return String(parsed)
  } catch (e) {
    console.log('[parseAIResponse] JSON parse failed, returning raw (first 300):', raw.substring(0, 300))
    return raw
  }
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

  const response = await fetchWithTimeout(`${config.api.baseUrl}/post/autoCompleteAI`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code_ai: prompt }),
  })

  console.log('[generateCodeAI] response status:', response.status, 'ok:', response.ok)

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status, response.status)
  }

  const raw = await response.text()
  console.log('[generateCodeAI] raw response (first 300):', raw.substring(0, 300))
  const result = parseAIResponse(raw)
  console.log('[generateCodeAI] parsed result (first 300):', result.substring(0, 300))

  // Strip markdown code fences if present
  return result.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim()
}

/**
 * Generate text content using AI
 */
export async function generateTextAI(prompt: string): Promise<string> {
  logger.api(`Generating AI text for prompt: ${prompt}`);

  const response = await fetchWithTimeout(`${config.api.baseUrl}/post/autoCompleteAI`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text_ai: prompt }),
  })

  console.log('[generateTextAI] response status:', response.status, 'ok:', response.ok)

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status, response.status)
  }

  const raw = await response.text()
  console.log('[generateTextAI] raw response (first 300):', raw.substring(0, 300))
  const result = parseAIResponse(raw)
  console.log('[generateTextAI] parsed result (first 300):', result.substring(0, 300))
  return result
}

/**
 * Authenticate with Google credential (ID token)
 */
export async function googleLogin(credential: string): Promise<{ token: string; user: { id: number; email: string; name: string; image: string; role: string } }> {
  logger.api('Google login');

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/auth/google`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    }
  );

  return handleResponse(response);
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

// ==================== Projects ====================

/**
 * Get all projects (authenticated)
 */
export async function getProjects(options?: { requireAuth?: boolean }): Promise<Project[]> {
  const requireAuth = options?.requireAuth ?? true;
  logger.api('Fetching all projects');

  const endpoint = requireAuth
    ? `${config.api.baseUrl}/project/getAll`
    : `${config.api.baseUrl}/project/getPublic`;

  try {
    const response = await fetchWithTimeout(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await handleResponse<unknown>(response);
    if (!Array.isArray(data)) {
      logger.warn('Unexpected API response format for getProjects');
      return [];
    }
    return data as Project[];
  } catch (error) {
    logger.error('Failed to fetch projects:', error);
    return [];
  }
}

/**
 * Get a single project by ID
 */
export async function getProjectById(id: string, options?: { requireAuth?: boolean }): Promise<Project | null> {
  const requireAuth = options?.requireAuth ?? true;
  logger.api(`Fetching project: ${id}`);

  const endpoint = requireAuth
    ? `${config.api.baseUrl}/project/getProject/${id}`
    : `${config.api.baseUrl}/project/getPublic/${id}`;

  const response = await fetchWithTimeout(endpoint, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.status === 404) {
    return null;
  }

  return handleResponse<Project>(response);
}

/**
 * Create a new project
 */
export async function createProject(data: {
  title: string;
  description?: string;
  type: string;
  url?: string;
  embed_url?: string;
  image_url?: string;
  github_url?: string;
  tech_stack?: string;
}): Promise<{ message: string }> {
  logger.api(`Creating project: ${data.title}`);

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/project/create`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );

  return handleResponse<{ message: string }>(response);
}

/**
 * Update an existing project
 */
export async function updateProject(data: {
  id: number;
  title?: string;
  description?: string;
  type?: string;
  url?: string;
  embed_url?: string;
  image_url?: string;
  github_url?: string;
  tech_stack?: string;
}): Promise<{ message: string }> {
  logger.api(`Updating project: ${data.id}`);

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/project/update`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );

  return handleResponse<{ message: string }>(response);
}

/**
 * Delete a project by ID
 */
export async function deleteProject(id: string): Promise<void> {
  logger.api(`Deleting project: ${id}`);

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/project/delete/${id}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return handleResponse<void>(response);
}

// ==================== Admin Notifications ====================

/**
 * Get all admin notifications
 */
export async function getNotifications(): Promise<Notification[]> {
  logger.api('Fetching admin notifications');

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/admin/notifications`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );

  const data = await handleResponse<unknown>(response);
  if (!Array.isArray(data)) return [];
  return data as Notification[];
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<number> {
  logger.api('Fetching unread notification count');

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/admin/notifications/unread-count`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );

  const data = await handleResponse<{ unread_count: number }>(response);
  return data.unread_count ?? 0;
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(id: string): Promise<void> {
  logger.api(`Marking notification ${id} as read`);

  await fetchWithTimeout(
    `${config.api.baseUrl}/admin/notifications/mark-read/${id}`,
    { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<void> {
  logger.api('Marking all notifications as read');

  await fetchWithTimeout(
    `${config.api.baseUrl}/admin/notifications/mark-all-read`,
    { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<void> {
  logger.api(`Deleting notification ${id}`);

  await fetchWithTimeout(
    `${config.api.baseUrl}/admin/notifications/${id}`,
    { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }
  );
}

// ==================== Admin Post Approval ====================

/**
 * Get a pending post by ID (admin only)
 */
export async function getPendingPostByID(id: number): Promise<Post> {
  logger.api(`Fetching pending post ${id}`);

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/admin/post/pending/${id}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );

  return handleResponse<Post>(response);
}

/**
 * Get pending posts (admin only)
 */
export async function getPendingPosts(): Promise<Post[]> {
  logger.api('Fetching pending posts');

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/admin/post/pending`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );

  const data = await handleResponse<unknown>(response);
  if (!Array.isArray(data)) return [];
  return data as Post[];
}

/**
 * Approve a post (admin only)
 */
export async function approvePost(id: number): Promise<{ message: string }> {
  logger.api(`Approving post ${id}`);

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/admin/post/approve/${id}`,
    { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
  );

  return handleResponse<{ message: string }>(response);
}

/**
 * Reject a post (admin only)
 */
export async function rejectPost(id: number): Promise<{ message: string }> {
  logger.api(`Rejecting post ${id}`);

  const response = await fetchWithTimeout(
    `${config.api.baseUrl}/admin/post/reject/${id}`,
    { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }
  );

  return handleResponse<{ message: string }>(response);
}
