import { marked } from 'marked'

export function markdownToHtml(content: string): string {
  return marked.parse(content, { async: false }) as string
}
