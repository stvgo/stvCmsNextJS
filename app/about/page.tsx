import { DashboardLayout } from '@/components/dashboard-layout';
import { AboutMe } from '@/components/about-me';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">About Me</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personal profile &amp; bio
          </p>
        </div>

        <AboutMe />
      </div>
    </DashboardLayout>
  );
}