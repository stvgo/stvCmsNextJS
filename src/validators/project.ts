import { z } from 'zod';

/**
 * Project Validators
 */

export const projectTypeSchema = z.enum(['game', 'web', 'api', 'tool', 'library']);

export type ProjectType = z.infer<typeof projectTypeSchema>;

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').trim(),
  description: z.string().optional(),
  type: projectTypeSchema,
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  embed_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  github_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  tech_stack: z.string().optional(),
  user_id: z.string().optional(),
});

export type CreateProject = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  id: z.number().int().positive('Project ID must be positive'),
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().optional(),
  type: projectTypeSchema.optional(),
  url: z.string().url().optional().or(z.literal('')),
  embed_url: z.string().url().optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  tech_stack: z.string().optional(),
});

export type UpdateProject = z.infer<typeof updateProjectSchema>;

export const projectSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().nullable(),
  type: projectTypeSchema,
  url: z.string().nullable(),
  embed_url: z.string().nullable(),
  image_url: z.string().nullable(),
  github_url: z.string().nullable(),
  tech_stack: z.string().nullable(),
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Project = z.infer<typeof projectSchema>;

export function validateCreateProject(data: unknown) {
  return createProjectSchema.safeParse(data);
}

export function validateUpdateProject(data: unknown) {
  return updateProjectSchema.safeParse(data);
}