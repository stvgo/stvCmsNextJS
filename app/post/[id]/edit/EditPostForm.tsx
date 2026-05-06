"use client";

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, Type, Code, Image, Link2, Loader2 } from 'lucide-react';
import { CodeEditor } from '@/components/CodeEditor';
import { CMSImage } from '@/components/cms-image';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useImageUpload } from '@/hooks/use-image-upload';
import { updatePostAction } from '../../../actions';
import type { ContentBlockType, Post, ContentBlock } from '@/types/post';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'c', 'cpp', 'csharp',
  'ruby', 'php', 'swift', 'kotlin', 'scala', 'html', 'css', 'sql', 'bash', 'json', 'yaml'
];

interface EditorBlock {
  id: string;
  type: ContentBlockType;
  content: string;
  language?: string;
}

type EditPostFormProps = {
  post: Post;
};

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post.title,
    },
  });

  // Initialize blocks from post content_blocks
  const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
    (post.content_blocks || []).map((block, index) => ({
      id: `block-${block.id || index}`,
      type: block.type,
      content: block.content,
      language: block.language,
    }))
  );

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addBlock = useCallback((type: ContentBlockType) => {
    const newBlock: EditorBlock = {
      id: crypto.randomUUID(),
      type,
      content: '',
      language: type === 'code' ? 'javascript' : undefined,
    };
    setBlocks(prev => [...prev, newBlock]);
    setShowAddMenu(false);
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<EditorBlock>) => {
    setBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, ...updates } : block
    ));
  }, []);

  const onSubmit = async (data: z.infer<typeof postSchema>) => {
    setIsSubmitting(true);
    try {
      const contentBlocks = blocks
        .filter(block => block.content.trim())
        .map((block, index) => ({
          type: block.type,
          order: index,
          content: block.content,
          ...(block.language && { language: block.language }),
        }));

      await updatePostAction({
        id: post.id,
        title: data.title,
        content_blocks: contentBlocks,
      });
      toast.success('Post updated successfully');
    } catch (error) {
      toast.error('Failed to update post');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register('title')} />
        {form.formState.errors.title && (
          <p className="text-destructive text-sm">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* Content Blocks */}
      <div className="space-y-2">
        <Label>Content Blocks</Label>
        <div className="space-y-4">
          {blocks.map((block) => (
            <ContentBlockEditor
              key={block.id}
              block={block}
              onUpdate={updateBlock}
              onRemove={removeBlock}
            />
          ))}

          {/* Add Block Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            >
              <Plus className={`h-5 w-5 transition-transform ${showAddMenu ? 'rotate-45' : ''}`} />
            </button>

            {showAddMenu && (
              <div className="absolute left-14 top-0 flex items-center space-x-2 bg-card border border-border rounded-lg p-2 shadow-xl z-50">
                <button
                  type="button"
                  onClick={() => addBlock('text')}
                  className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Type className="h-4 w-4" />
                  <span className="text-sm">Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('code')}
                  className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Code className="h-4 w-4" />
                  <span className="text-sm">Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('images')}
                  className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Image className="h-4 w-4" />
                  <span className="text-sm">Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('urls')}
                  className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Link2 className="h-4 w-4" />
                  <span className="text-sm">Link</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

/**
 * Individual content block editor for the edit form
 */
function ContentBlockEditor({
  block,
  onUpdate,
  onRemove,
}: {
  block: EditorBlock;
  onUpdate: (id: string, updates: Partial<EditorBlock>) => void;
  onRemove: (id: string) => void;
}) {
  const { upload, loading: uploading } = useImageUpload();

  return (
    <div className="group relative">
      {/* Block type badge + delete */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {block.type}
        </span>
        <button
          type="button"
          onClick={() => onRemove(block.id)}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {block.type === 'text' && (
        <RichTextEditor
          value={block.content}
          onChange={(html) => onUpdate(block.id, { content: html })}
        />
      )}

      {block.type === 'code' && (
        <div className="bg-muted rounded-lg overflow-hidden border border-border">
          <div className="flex items-center px-4 py-2 border-b border-border bg-accent/50">
            <Select
              value={block.language}
              onValueChange={(value) => onUpdate(block.id, { language: value })}
            >
              <SelectTrigger className="h-7 w-32 text-xs bg-transparent border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CodeEditor
            value={block.content}
            onChange={(value) => onUpdate(block.id, { content: value })}
            language={block.language || 'javascript'}
            placeholder="// Your code here..."
          />
        </div>
      )}

      {block.type === 'images' && (
        <div>
          {!block.content ? (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted hover:bg-accent transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Image className="w-8 h-8 mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                      <p className="text-xs text-muted-foreground">JPG, JPEG or PNG</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const allowed = ['image/jpeg', 'image/png'];
                    if (!allowed.includes(file.type)) {
                      toast.error('Only JPG, JPEG and PNG files are allowed');
                      e.target.value = '';
                      return;
                    }
                    const result = await upload(file);
                    if (result) {
                      onUpdate(block.id, { content: result });
                    }
                  }}
                />
              </label>
            </div>
          ) : (
            <div className="relative group">
              <CMSImage
                src={block.content}
                alt="Content"
                width={800}
                height={600}
                rounded
              />
              <button
                type="button"
                onClick={() => onUpdate(block.id, { content: '' })}
                className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {block.type === 'urls' && (
        <input
          value={block.content}
          onChange={(e) => onUpdate(block.id, { content: e.target.value })}
          placeholder="https://..."
          type="url"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
        />
      )}
    </div>
  );
}