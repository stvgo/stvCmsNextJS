/**
 * React Query Keys
 * Centralized query key factory for better maintainability
 */

export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.posts.lists(), filters] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
  },
  images: {
    all: ['images'] as const,
    url: (filename: string) => [...queryKeys.images.all, filename] as const,
  },
} as const;
