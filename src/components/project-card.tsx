"use client"

import { Project } from "@/types/project"
import { Gamepad2, Globe, Server, Wrench, BookOpen, ExternalLink, Github } from "lucide-react"
import Link from "next/link"

const typeIcons: Record<string, React.ReactNode> = {
  game: <Gamepad2 className="h-5 w-5" />,
  web: <Globe className="h-5 w-5" />,
  api: <Server className="h-5 w-5" />,
  tool: <Wrench className="h-5 w-5" />,
  library: <BookOpen className="h-5 w-5" />,
}

const typeLabels: Record<string, string> = {
  game: "Game",
  web: "Web",
  api: "API",
  tool: "Tool",
  library: "Library",
}

const typeColors: Record<string, string> = {
  game: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  web: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  api: "bg-green-500/10 text-green-500 border-green-500/20",
  tool: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  library: "bg-pink-500/10 text-pink-500 border-pink-500/20",
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const techTags = project.tech_stack
    ? project.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
    : []

  return (
    <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`rounded-md p-2 ${typeColors[project.type] || "bg-muted text-muted-foreground"}`}>
            {typeIcons[project.type] || <Wrench className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <Link href={`/projects/${project.id}`} className="hover:underline">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {project.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${typeColors[project.type] || "bg-muted text-muted-foreground"}`}>
                {typeLabels[project.type] || project.type}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="View on GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          )}
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Visit project"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {project.description && (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
      )}

      {project.embed_url && (
        <div className="mt-3 space-y-2">
          <div className="rounded-lg overflow-hidden border border-border bg-black">
            <iframe
              src={project.embed_url}
              className="w-full border-0"
              style={{ height: '400px', minWidth: '200px' }}
              title={project.title}
              allow="autoplay; fullscreen; gamepad; clipboard-write"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox"
              loading="lazy"
            />
          </div>
          <a
            href={project.embed_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Open full screen
          </a>
        </div>
      )}

      {techTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {techTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-muted-foreground">
        {new Date(project.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </div>
    </div>
  )
}