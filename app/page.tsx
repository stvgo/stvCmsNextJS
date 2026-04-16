import { Suspense } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PostsList } from '@/components/posts-list';
import { getPosts } from '@/lib/api';
import { DashboardSkeleton } from '@/components/loading-skeletons';
import { ErrorBoundary } from '@/components/error-boundary';

export const dynamic = 'force-dynamic';

async function PostsContent() {
  const posts = await getPosts();
  return <PostsList posts={posts} />;
}

export default async function Dashboard() {
  const posts = await getPosts();
  const postCount = posts.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Posts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your content
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {postCount} {postCount === 1 ? 'post' : 'posts'} total
          </div>
        </div>

        <ErrorBoundary>
          <Suspense fallback={<PostsContent />}>
            <PostsContent />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
}
