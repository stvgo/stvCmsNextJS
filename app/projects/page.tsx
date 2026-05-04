import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ProjectsList } from '@/components/projects-list';
import { getProjects } from '@/lib/api';
import { ErrorBoundary } from '@/components/error-boundary';
import { Project } from '@/types/project';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('stv_token')?.value;

  const allProjects = await getProjects({ requireAuth: !!token });

  const projectCount = Array.isArray(allProjects) ? allProjects.length : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {token ? 'Showcase your work' : 'Public projects'}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {projectCount} {projectCount === 1 ? 'project' : 'projects'}
          </div>
        </div>

        <ErrorBoundary>
          <Suspense fallback={<ProjectsContent projects={allProjects as Project[]} />}>
            <ProjectsContent projects={allProjects as Project[]} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
}

function ProjectsContent({ projects }: { projects: Project[] }) {
  return <ProjectsList projects={projects} />;
}