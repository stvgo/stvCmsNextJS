"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function GitHubCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get("token")
    const error = searchParams.get("error")

    if (error) {
      console.error("GitHub auth error:", error)
      router.push("/login?error=github")
      return
    }

    if (!token) {
      router.push("/login?error=no_token")
      return
    }

    async function fetchUserAndLogin() {
      try {
        const res = await fetch("/api/proxy/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch user")
        }

        const user = await res.json()
        login(token!, user)
        router.push("/")
      } catch (err) {
        console.error("GitHub callback error:", err)
        router.push("/login?error=auth_failed")
      }
    }

    fetchUserAndLogin()
  }, [searchParams, login, router])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      <p className="text-sm text-neutral-600">Signing in with GitHub...</p>
    </div>
  )
}