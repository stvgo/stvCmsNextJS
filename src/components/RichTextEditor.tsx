"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Sparkles, X, ArrowRight, Loader2 } from 'lucide-react'
import { useState, useRef } from 'react'
import { generateTextAI } from '@/lib/api'
import { toast } from 'sonner'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = 'Tell your story...' }: RichTextEditorProps) {
  const [showAI, setShowAI] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-neutral dark:prose-invert max-w-none min-h-[100px] focus:outline-none text-lg text-foreground',
      },
    },
  })

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim() || !editor) return

    setLoadingAI(true)
    try {
      const html = await generateTextAI(aiPrompt)
      const clean = html.replace(/>\s*\n+\s*</g, '><').trim()
      editor.chain().focus().insertContent(clean).run()
      onChange(editor.getHTML())
      setAiPrompt('')
      setShowAI(false)
    } catch {
      toast.error('Failed to generate text')
    } finally {
      setLoadingAI(false)
    }
  }

  if (!editor) return null

  return (
    <div className="w-full">
      <div className="flex items-center gap-1 mb-2 pb-2 border-b border-border">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton
          onClick={() => {
            setShowAI(v => !v)
            setTimeout(() => inputRef.current?.focus(), 50)
          }}
          active={showAI}
          title="Generate with AI"
        >
          <Sparkles className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {showAI && (
        <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-accent/40 border border-border">
          <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAIGenerate()
              if (e.key === 'Escape') { setShowAI(false); setAiPrompt('') }
            }}
            placeholder="¿Sobre qué quieres escribir?"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            disabled={loadingAI}
          />
          {loadingAI ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
          ) : (
            <>
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={!aiPrompt.trim()}
                className="text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => { setShowAI(false); setAiPrompt('') }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  )
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-accent text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}
    >
      {children}
    </button>
  )
}
