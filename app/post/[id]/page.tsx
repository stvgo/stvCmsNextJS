import { getPostById, getImageUrl } from '@/lib/api';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ContentBlock } from '@/types/post';
import { CodeBlock } from '@/components/CodeBlock';

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

function renderContentBlock(block: ContentBlock) {
  switch (block.type) {
    case 'text':
      return (
        <div
          className="prose prose-neutral dark:prose-invert max-w-none text-foreground/80"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );
    case 'code':
      return <CodeBlock code={block.content} language={block.language} />;
    case 'images':
      return (
        <img
          src={getImageUrl(block.content)}
          alt="Post content"
          className="max-w-full rounded-lg"
        />
      );
    case 'urls':
      return (
        <a
          href={block.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          {block.content}
        </a>
      );
    default:
      return <p>{block.content}</p>;
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const sortedBlocks = post.contentBlocks
    ? [...post.contentBlocks].sort((a, b) => a.order - b.order)
    : [];

  return (
    <DashboardLayout>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{post.title}</CardTitle>
          <div className="text-sm text-muted-foreground mt-2">
            <span>By {post.userId}</span>
            <span className="mx-2">•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {sortedBlocks.length > 0 ? (
            sortedBlocks.map((block) => (
              <div key={block.id || block.order}>
                {renderContentBlock(block)}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground italic">No content</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
} 