import { Suspense } from "react"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6">
      <div className="flex w-full max-w-sm flex-col items-center">
        {/* Logo */}
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-sm">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-800"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          STV CMS
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Sign in to continue
        </p>

        {/* Buttons */}
        <div className="mt-8 w-full">
          <Suspense
            fallback={
              <div className="flex h-11 w-full animate-pulse items-center justify-center rounded-lg border border-neutral-100 bg-neutral-100">
                <span className="text-sm font-medium text-neutral-300">Loading...</span>
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
