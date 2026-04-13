"use client"

import { Post } from "@/types/post"
import { ForumPostCard } from "./forum-post-card"
import { useSearch } from "@/contexts/search-context"
import { Loader2 } from "lucide-react"

interface PostsListProps {
  posts: Post[]
}

export function PostsList({ posts }: PostsListProps) {
  const { searchResults, isSearching, hasActiveSearch } = useSearch()

  // Use search results when there's an active search
  const displayPosts = hasActiveSearch ? searchResults : posts

  // Show "No results found" only when NOT searching and there are no results
  const showNoResults = !isSearching && (!Array.isArray(displayPosts) || displayPosts.length === 0)

  if (showNoResults) {
    const message = hasActiveSearch
      ? {
          title: "No results found",
          description: "No posts matching your search",
        }
      : {
          title: "No posts yet",
          description: "Be the first to start a discussion!",
        }

    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-lg">
        <h3 className="text-2xl font-bold tracking-tight">{message.title}</h3>
        <p className="text-sm text-muted-foreground mt-2">{message.description}</p>
      </div>
    )
  }

  // Show loading state while searching
  if (isSearching && hasActiveSearch) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-4">Searching...</p>
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
