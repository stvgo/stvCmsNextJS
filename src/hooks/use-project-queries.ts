import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

/**
 * Query hook to fetch all projects
 */
export function useProjects(options?: { requireAuth?: boolean }) {
  return useQuery({
    queryKey: queryKeys.projects.lists(),
    queryFn: () => getProjects(options),
  });
}

/**
 * Query hook to fetch a single project
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => getProjectById(id),
    enabled: !!id,
  });
}

/**
 * Mutation hook to create a project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof createProject>[0]) => createProject(data),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
  });
}

/**
 * Mutation hook to update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updateProject>[0]) => updateProject(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(String(variables.id)) });
      return queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
  });
}

/**
 * Mutation hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(id) });
      return queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
  });
}