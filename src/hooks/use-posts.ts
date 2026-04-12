import { useState, useCallback, useEffect } from 'react';
import { getPosts, getPostById, createPost, updatePost, deletePost } from '@/lib/api';
import type { Post, CreatePost, UpdatePost } from '@/types/post';
import { getErrorMessage } from '@/lib/api-errors';

/**
 * Hook to fetch all posts
 * @example
 * const { posts, loading, error, refetch } = usePosts();
 */
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  };
}

/**
 * Hook to fetch a single post by ID
 * @example
 * const { post, loading, error } = usePost('123');
 */
export function usePost(id: string | undefined) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setPost(null);
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPostById(id);
        setPost(data);
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  return {
    post,
    loading,
    error,
  };
}

/**
 * Hook to create a post
 * @example
 * const { createPostMutation, loading, error } = useCreatePost();
 * await createPostMutation({ title: 'New Post', user_id: 'user1' });
 */
export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createPostMutation = useCallback(async (data: CreatePost) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await createPost(data);
      setSuccess(true);
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    createPost: createPostMutation,
    loading,
    error,
    success,
    reset,
  };
}

/**
 * Hook to update a post
 * @example
 * const { updatePostMutation, loading } = useUpdatePost();
 * await updatePostMutation({ id: 1, title: 'Updated Title' });
 */
export function useUpdatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updatePostMutation = useCallback(async (data: UpdatePost) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await updatePost(data);
      setSuccess(true);
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    updatePost: updatePostMutation,
    loading,
    error,
    success,
    reset,
  };
}

/**
 * Hook to delete a post
 * @example
 * const { deletePostMutation, loading } = useDeletePost();
 * await deletePostMutation('123');
 */
export function useDeletePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const deletePostMutation = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await deletePost(id);
      setSuccess(true);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    deletePost: deletePostMutation,
    loading,
    error,
    success,
    reset,
  };
}
