"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, Type, Code, Image, Link2 } from "lucide-react"
import type { ContentBlockType } from "@/types/post"
import { CodeEditor } from "@/components/CodeEditor"
import { CMSImage } from "@/components/cms-image"
import { useCreatePost } from "@/hooks/use-post-queries"
import { useImageUpload } from "@/hooks/use-image-upload"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface EditorBlock {
  id: string
  type: ContentBlockType
  content: string
  language?: string
}

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'c', 'cpp', 'csharp',
  'ruby', 'php', 'swift', 'kotlin', 'scala', 'html', 'css', 'sql', 'bash', 'json', 'yaml'
]

export function PostEditor() {
  const router = useRouter()
  const createPostMutation = useCreatePost()
  const [title, setTitle] = useState("")
  const [blocks, setBlocks] = useState<EditorBlock[]>([])
  const [showAddMenu, setShowAddMenu] = useState(false)

  const addBlock = useCallback((type: ContentBlockType) => {
    const newBlock: EditorBlock = {
      id: crypto.randomUUID(),
      type,
      content: '',
      language: type === 'code' ? 'javascript' : undefined
    }
    setBlocks(prev => [...prev, newBlock])
    setShowAddMenu(false)
  }, [])

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id))
  }, [])

  const updateBlock = useCallback((id: string, updates: Partial<EditorBlock>) => {
    setBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, ...updates } : block
    ))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    if (blocks.length === 0) {
      toast.error('Add at least one content block')
      return
    }

    try {
      const contentBlocks = blocks
        .filter(block => block.content.trim())
        .map((block, index) => ({
          type: block.type,
          order: index,
          content: block.content,
          ...(block.language && { language: block.language })
        }))

      await createPostMutation.mutateAsync({
        title,
        user_id: 'user123',
        content_blocks: contentBlocks
      })

      toast.success('Post published successfully')
      router.push('/')
    } catch (error) {
      console.error('Failed to create post:', error)
      toast.error('Failed to create post')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <Button
              type="submit"
              disabled={createPostMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
            >
              {createPostMutation.isPending ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Title */}
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-transparent text-4xl font-bold text-foreground placeholder:text-muted-foreground border-none outline-none resize-none mb-8"
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = "auto"
            target.style.height = target.scrollHeight + "px"
          }}
        />

        {/* Content Blocks */}
        <div className="space-y-6">
          {blocks.map((block) => (
            <ContentBlock
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
  )
}

/**
 * Individual content block component
 */
function ContentBlock({
  block,
  onUpdate,
  onRemove,
}: {
  block: EditorBlock
  onUpdate: (id: string, updates: Partial<EditorBlock>) => void
  onRemove: (id: string) => void
}) {
  const { upload, loading: uploading, previewUrl, filename } = useImageUpload()

  return (
    <div className="group relative">
      {/* Delete button */}
      <button
        type="button"
        onClick={() => onRemove(block.id)}
        className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {block.type === 'text' && (
        <Textarea
          value={block.content}
          onChange={(e) => onUpdate(block.id, { content: e.target.value })}
          placeholder="Tell your story..."
          className="w-full min-h-[100px] bg-transparent border-none text-lg text-foreground placeholder:text-muted-foreground resize-none focus:ring-0 p-0"
          autoFocus
        />
      )}

      {block.type === 'code' && (
        <div className="bg-muted rounded-lg overflow-hidden border border-border">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-accent/50">
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
                    <div className="text-sm text-muted-foreground">Uploading...</div>
                  ) : (
                    <>
                      <Image className="w-8 h-8 mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                      <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    const result = await upload(file)
                    if (result) {
                      onUpdate(block.id, { content: result })
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
  )
}
