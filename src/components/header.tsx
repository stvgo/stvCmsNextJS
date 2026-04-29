"use client"

import { Menu, Bell, Search, Sun, Moon, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useSearch } from "@/contexts/search-context"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void
}

function getInitials(name?: string | null): string {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function Header({ setSidebarOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { searchQuery, setSearchQuery, clearSearch, hasActiveSearch } = useSearch()
  const [mounted, setMounted] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        className="-m-2.5 p-2.5 text-muted-foreground lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="h-6 w-px bg-border lg:hidden" />

      <div className="flex flex-1 items-center justify-end gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center gap-x-4 self-stretch">
          <Link href="/post/create">
            <Button>
              Create Post
            </Button>
          </Link>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground ml-3" />
            <Input
              className="block h-full w-full border-0 bg-muted py-0 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:ring-0 sm:text-sm"
              placeholder="Search posts..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {hasActiveSearch && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {mounted && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(theme === "bw" ? "dark" : "bw")}
              title={theme === "bw" ? "Switch to dark theme" : "Switch to B&W theme"}
            >
              {theme === "bw" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          )}

          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Bell className="h-6 w-6" />
          </Button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />

          <div className="flex items-center gap-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || "/foto.jpg"} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-semibold leading-6 text-foreground lg:block">
              {session?.user?.name || "User"}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
