"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getPendingPostByID, approvePost, rejectPost } from "@/lib/api"
import { queryKeys } from "@/lib/query-keys"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check, X, Clock, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { ContentBlock } from "@/types/post"
import { CodeBlock } from "@/components/CodeBlock"
import { getImageUrl } from "@/lib/api"

function renderContentBlock(block: ContentBlock) {
  switch (block.type) {
    case "text":
      return (
        <div
          className="prose prose-neutral max-w-none text-foreground/80"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      )
    case "code":
      return <CodeBlock code={block.content} language={block.language} />
    case "images":
      return (
        <img
          src={getImageUrl(block.content)}
          alt="Post content"
          className="max-w-full rounded-lg"
        />
      )
    case "urls":
      return (
        <a
          href={block.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {block.content}
        </a>
      )
    default:
      return <p>{block.content}</p>
  }
}

export default function PendingPostPage() {
  const { isAdmin, isAuthenticated, isLoading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = Number(params.id)

  const { data: post, isLoading } = useQuery({
    queryKey: [...queryKeys.posts.pending(), id],
    queryFn: () => getPendingPostByID(id),
    enabled: isAdmin && !!id,
  })

  const approveMutation = useMutation({
    mutationFn: approvePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      router.push("/admin")
    },
  })

  const rejectMutation = useMutation({
    mutationFn: rejectPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      router.push("/admin")
    },
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading || isLoading) {
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
            You don&apos;t have permission to view this page.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  if (!post) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-2xl font-bold">Post not found</h2>
          <button
            className="mt-4 inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const sortedBlocks = post.content_blocks
    ? [...post.content_blocks].sort((a, b) => a.order - b.order)
    : []

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <span className="inline-flex items-center rounded-full border border-amber-400 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            <Clock className="h-3 w-3 mr-1" />
            Pending Approval
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              onClick={() => approveMutation.mutate(post.id)}
              disabled={approveMutation.isPending}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </button>
            <button
              className="inline-flex items-center justify-center rounded-md border border-red-400 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              onClick={() => rejectMutation.mutate(post.id)}
              disabled={rejectMutation.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </button>
          </div>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{post.title}</CardTitle>
            <div className="text-sm text-muted-foreground mt-2">
              <span>By {post.user_id}</span>
              <span className="mx-2">&bull;</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
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
      </div>
    </DashboardLayout>
  )
}