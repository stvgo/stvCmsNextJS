import { Suspense } from "react"
import { GitHubCallbackHandler } from "./callback-handler"

export default function GitHubCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
            <p className="text-sm text-neutral-600">Signing in with GitHub...</p>
          </div>
        }
      >
        <GitHubCallbackHandler />
      </Suspense>
    </div>
  )
}