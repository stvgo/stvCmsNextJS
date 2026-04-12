import { Post } from "@/types/post"
import { ForumPostCard } from "./forum-post-card";

interface PostsListProps {
  posts: Post[];
}

export function PostsList({ posts }: PostsListProps) {
  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-lg">
        <h3 className="text-2xl font-bold tracking-tight">No posts yet</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Be the first to start a discussion!
        </p>
      </div>
    );
  }
  const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="space-y-6">
      {sortedPosts.map((post) => (
        <ForumPostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
