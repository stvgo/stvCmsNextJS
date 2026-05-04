"use client"

import { Project } from "@/types/project"
import { ProjectCard } from "./project-card"

interface ProjectsListProps {
  projects: Project[]
}

export function ProjectsList({ projects }: ProjectsListProps) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-lg">
        <h3 className="text-2xl font-bold tracking-tight">No projects yet</h3>
        <p className="text-sm text-muted-foreground mt-2">Projects will appear here once created</p>
      </div>
    )
  }

  const sorted = [...projects].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime()
    const timeB = new Date(b.created_at).getTime()
    if (!isFinite(timeA) || !isFinite(timeB)) return 0
    return timeB - timeA
  })

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sorted.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}