"use client"

import { Post } from "@/types/post"
import { ForumPostCard } from "./forum-post-card"
import { useSearch } from "@/contexts/search-context"
import { Loader2 } from "lucide-react"

interface PostsListProps {
  posts: Post[]
}

export function PostsList({ posts }: PostsListProps) {
  const { searchResults, isSearching, hasActiveSearch, isPending } = useSearch()

  // Use search results when there's an active search
  const displayPosts = hasActiveSearch ? searchResults : posts

  // Show loading state while pending (debouncing) or actively searching
  if ((isPending || isSearching) && hasActiveSearch) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-4">Searching...</p>
      </div>
    )
  }

  // Show "No results found" only when search is complete and there are no results
  const showNoResults = !isSearching && !isPending && hasActiveSearch && (!Array.isArray(displayPosts) || displayPosts.length === 0)

  if (showNoResults) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-lg">
        <h3 className="text-2xl font-bold tracking-tight">No results found</h3>
        <p className="text-sm text-muted-foreground mt-2">No posts matching your search</p>
      </div>
    )
  }

  // Show empty state when no posts and no search
  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-lg">
        <h3 className="text-2xl font-bold tracking-tight">No posts yet</h3>
        <p className="text-sm text-muted-foreground mt-2">Be the first to start a discussion!</p>
      </div>
    )
  }
  
  const sortedPosts = [...displayPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="space-y-6">
      {hasActiveSearch && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className={`h-4 w-4 ${isSearching ? "animate-spin" : "hidden"}`} />
          <span>
            {isSearching
              ? "Searching..."
              : `Found ${displayPosts.length} ${displayPosts.length === 1 ? "result" : "results"}`}
          </span>
        </div>
      )}
      {sortedPosts.map((post) => (
        <ForumPostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
