import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PostsList } from '@/components/posts-list';
import { getPosts } from '@/lib/api';
import { ErrorBoundary } from '@/components/error-boundary';
import { Post } from '@/types/post';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('stv_token')?.value;

  const allPosts = await getPosts({ requireAuth: !!token });

  const postCount = allPosts.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Posts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {token ? 'Manage your content' : 'Public posts'}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {postCount} {postCount === 1 ? 'post' : 'posts'} total
          </div>
        </div>

        <ErrorBoundary>
          <Suspense fallback={<PostsContent posts={allPosts} />}>
            <PostsContent posts={allPosts} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
}

function PostsContent({ posts }: { posts: Post[] }) {
  return <PostsList posts={posts} />;
}