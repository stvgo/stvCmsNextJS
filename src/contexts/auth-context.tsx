"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"

export interface AuthUser {
  id: number
  email: string
  name: string
  image: string
  role: string
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = "stv_token"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
      document.cookie = `${STORAGE_KEY}=; path=/; max-age=0`
    }
    setUser(null)
  }, [])

  const login = useCallback((token: string, userData: AuthUser) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, token)
      document.cookie = `${STORAGE_KEY}=${token}; path=/; max-age=${60 * 60 * 24}`
    }
    setUser(userData)
  }, [])

  useEffect(() => {
    async function initAuth() {
      if (typeof window === "undefined") {
        setIsLoading(false)
        return
      }

      const token = localStorage.getItem(STORAGE_KEY)
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch("/api/proxy/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error("Session invalid")
        }

        const data = await res.json()
        setUser(data as AuthUser)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
