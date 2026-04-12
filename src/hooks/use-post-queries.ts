import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, getPostById, createPost, updatePost, deletePost } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { CreatePost, UpdatePost } from '@/types/post';

/**
 * Query hook to fetch all posts
 * @example
 * const { data: posts, isLoading, error } = usePosts();
 */
export function usePosts() {
  return useQuery({
    queryKey: queryKeys.posts.lists(),
    queryFn: getPosts,
  });
}

/**
 * Query hook to fetch a single post
 * @example
 * const { data: post, isLoading, error } = usePost('123');
 */
export function usePost(id: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => getPostById(id),
    enabled: !!id,
  });
}

/**
 * Mutation hook to create a post
 * @example
 * const mutation = useCreatePost();
 * await mutation.mutateAsync({ title: 'New Post', user_id: 'user1' });
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePost) => createPost(data),
    onSuccess: () => {
      // Invalidate and refetch posts list
      return queryClient.invalidateQueries({
        queryKey: queryKeys.posts.lists(),
      });
    },
  });
}

/**
 * Mutation hook to update a post
 * @example
 * const mutation = useUpdatePost();
 * await mutation.mutateAsync({ id: 1, title: 'Updated' });
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePost) => updatePost(data),
    onSuccess: (data) => {
      // Update the specific post in cache
      queryClient.setQueryData(queryKeys.posts.detail(String(data.id)), data);
      // Invalidate posts list
      return queryClient.invalidateQueries({
        queryKey: queryKeys.posts.lists(),
      });
    },
  });
}

/**
 * Mutation hook to delete a post
 * @example
 * const mutation = useDeletePost();
 * await mutation.mutateAsync('123');
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: (_, id) => {
      // Remove the deleted post from cache
      queryClient.removeQueries({
        queryKey: queryKeys.posts.detail(id),
      });
      // Invalidate posts list
      return queryClient.invalidateQueries({
        queryKey: queryKeys.posts.lists(),
      });
    },
  });
}
