import { z } from 'zod';

/**
 * Content Block Validators
 */

export const contentBlockTypeSchema = z.enum(['text', 'code', 'images', 'urls']);

export type ContentBlockType = z.infer<typeof contentBlockTypeSchema>;

export const contentBlockSchema = z.object({
  id: z.number().optional(),
  type: contentBlockTypeSchema,
  order: z.number().int().min(0),
  content: z.string().min(1, 'Content cannot be empty'),
  language: z.string().optional(),
});

export type ContentBlock = z.infer<typeof contentBlockSchema>;

/**
 * Post Validators
 */

export const createPostSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  user_id: z.string()
    .min(1, 'User ID is required')
    .trim(),
  content_blocks: z.array(contentBlockSchema).optional(),
});

export type CreatePost = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  id: z.number().int().positive('Post ID must be positive'),
  title: z.string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be less than 200 characters')
    .trim()
    .optional(),
  content_blocks: z.array(contentBlockSchema).optional(),
});

export type UpdatePost = z.infer<typeof updatePostSchema>;

export const postSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  userId: z.string(),
  contentBlocks: z.array(contentBlockSchema).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Post = z.infer<typeof postSchema>;

/**
 * API Response Validators
 */

export const apiErrorSchema = z.object({
  message: z.string(),
  status: z.number().int(),
  details: z.unknown().optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export const apiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.union([
    apiSuccessSchema(dataSchema),
    z.object({
      success: z.literal(false),
      error: apiErrorSchema,
    }),
  ]);

/**
 * Validation Helpers
 */

export function validateCreatePost(data: unknown) {
  return createPostSchema.safeParse(data);
}

export function validateUpdatePost(data: unknown) {
  return updatePostSchema.safeParse(data);
}

export function validateContentBlock(data: unknown) {
  return contentBlockSchema.safeParse(data);
}
