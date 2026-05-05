"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getPendingPosts, approvePost, rejectPost } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { Post } from "@/types/post"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, User, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

function getExcerpt(post: Post, length = 120): string {
  if (!post.content_blocks || post.content_blocks.length === 0)
    return "No content preview available."
  const textBlock = post.content_blocks.find((b) => b.type === "text")
  if (textBlock) {
    const plain = textBlock.content
      .replace(/<\/?(p|h[1-6]|li|br)[^>]*>/gi, " ")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
    return plain.length > length ? plain.substring(0, length) + "..." : plain
  }
  return "Click to view content."
}

export default function AdminPostsPage() {
  const { isAdmin, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: queryKeys.posts.pending(),
    queryFn: getPendingPosts,
    enabled: isAdmin,
  })

  const approveMutation = useMutation({
    mutationFn: approvePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: rejectPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pending Approval</h1>
            <p className="text-muted-foreground mt-1">
              Review and manage posts waiting for approval
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {posts.length} pending
          </Badge>
        </div>

        {postsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Check className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold">All caught up!</h3>
              <p className="text-muted-foreground mt-1">
                No posts are pending approval
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="border-l-4 border-l-amber-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {post.user_id}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-amber-400 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {getExcerpt(post)}
                  </p>
                  <Link
                    href={`/admin/pending/${post.id}`}
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Ver contenido
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}