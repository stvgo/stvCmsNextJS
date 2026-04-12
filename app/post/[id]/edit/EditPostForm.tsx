"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updatePostAction } from '../../../actions';
import type { Post } from '@/types/post';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

type EditPostFormProps = {
  post: Post;
};

export function EditPostForm({ post }: EditPostFormProps) {
  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post.title,
    },
  });

  const onSubmit = async (data: z.infer<typeof postSchema>) => {
    await updatePostAction({ 
      id: post.id, 
      title: data.title,
      content_blocks: post.contentBlocks?.map((block, index) => ({
        type: block.type,
        order: index,
        content: block.content,
        ...(block.language && { language: block.language }),
      })) || [],
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register('title')} />
        {form.formState.errors.title && (
          <p className="text-destructive text-sm">{form.formState.errors.title.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>Content Blocks</Label>
        <div className="text-sm text-muted-foreground">
          This post has {post.contentBlocks?.length || 0} content block(s).
          Use the PostEditor to edit content blocks.
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
