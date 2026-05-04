import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { DashboardLayout } from '@/components/dashboard-layout';
import { getProjectById } from '@/lib/api';
import { ErrorBoundary } from '@/components/error-boundary';
import { Gamepad2, Globe, Server, Wrench, BookOpen, ExternalLink, Github, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const typeIcons: Record<string, React.ReactNode> = {
  game: <Gamepad2 className="h-6 w-6" />,
  web: <Globe className="h-6 w-6" />,
  api: <Server className="h-6 w-6" />,
  tool: <Wrench className="h-6 w-6" />,
  library: <BookOpen className="h-6 w-6" />,
};

const typeLabels: Record<string, string> = {
  game: "Game",
  web: "Web App",
  api: "API",
  tool: "Tool",
  library: "Library",
};

const typeColors: Record<string, string> = {
  game: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  web: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  api: "bg-green-500/10 text-green-500 border-green-500/20",
  tool: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  library: "bg-pink-500/10 text-pink-500 border-pink-500/20",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('stv_token')?.value;

  const project = await getProjectById(id, { requireAuth: !!token });

  if (!project) {
    notFound();
  }

  const techTags = project.tech_stack
    ? project.tech_stack.split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>

        <ErrorBoundary>
          <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3" /><div className="h-64 bg-muted rounded" /></div>}>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-3 ${typeColors[project.type] || "bg-muted text-muted-foreground"}`}>
                  {typeIcons[project.type] || <Wrench className="h-6 w-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeColors[project.type] || "bg-muted text-muted-foreground"}`}>
                      {typeLabels[project.type] || project.type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(project.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    Source
                  </a>
                )}
              </div>

              {/* Description */}
              {project.description && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground">{project.description}</p>
                </div>
              )}

              {/* Embed */}
              {project.embed_url && (
                <div className="rounded-lg overflow-hidden border border-border">
                  <div className="relative aspect-video bg-muted">
                    <iframe
                      src={project.embed_url}
                      className="absolute inset-0 w-full h-full"
                      title={project.title}
                      sandbox="allow-scripts allow-same-origin"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              {techTags.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-foreground mb-2">Tech Stack</h2>
                  <div className="flex flex-wrap gap-2">
                    {techTags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-sm font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
}