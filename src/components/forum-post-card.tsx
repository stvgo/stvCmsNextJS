import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Post } from "@/types/post";
import { formatDistanceToNow } from "date-fns"; // You might need to install date-fns if not available, or use native Intl
import { MessageSquare, User, Calendar, Lock, Clock } from "lucide-react";

interface ForumPostCardProps {
  post: Post;
}

function getExcerpt(post: Post, length: number = 150): string {
  if (!post.content_blocks || post.content_blocks.length === 0) {
    return "No content preview available.";
  }

  // Find the first text block
  const textBlock = post.content_blocks.find((block) => block.type === "text");
  if (textBlock) {
    const plain = textBlock.content
      .replace(/<\/?(p|h[1-6]|li|br)[^>]*>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    return plain.length > length ? plain.substring(0, length) + "..." : plain
  }

  return "Click to view content.";
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    if (!isFinite(date.getTime())) {
        return 'Invalid date';
    }
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function ForumPostCard({ post }: ForumPostCardProps) {
  const excerpt = getExcerpt(post);

  return (
    <Card className="hover:shadow-md transition-shadow bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
            <Link href={`/post/${post.id}`} className="hover:underline">
                <CardTitle className="text-xl font-bold text-primary">{post.title}</CardTitle>
            </Link>
            {post.status === 'private' && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                <Lock className="w-3 h-3" />
                Private
              </span>
            )}
            {post.status === 'pending' && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">
                <Clock className="w-3 h-3" />
                Pending Approval
              </span>
            )}
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            <span>{post.user_id}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(post.created_at)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{excerpt}</p>
        <div className="mt-4 flex items-center justify-between">
            <Link href={`/post/${post.id}`} className="text-sm font-medium text-primary hover:underline flex items-center">
                Read more &rarr;
            </Link>
             {/* Placeholder for comment count if available in the future */}
            <div className="flex items-center text-muted-foreground text-sm">
                <MessageSquare className="w-4 h-4 mr-1" />
                <span>0 comments</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
