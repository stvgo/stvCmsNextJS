import { Suspense } from "react"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  const clientId = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID || ""

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex w-full max-w-[380px] flex-col items-center gap-4">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-700"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>

        <div className="flex w-full flex-col items-center gap-6">
          <Suspense
            fallback={
              <div className="flex h-10 w-full animate-pulse items-center justify-center border border-neutral-200 bg-neutral-100">
                <span className="text-sm text-neutral-400">Loading...</span>
              </div>
            }
          >
            <LoginForm clientId={clientId} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}