"use client"

import { Menu, Bell, Search, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useTheme } from "next-themes"

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void
}

export function Header({ setSidebarOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme()

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
        <Link href="/post/create">
          <Button>
            Create Post
          </Button>
        </Link>
        <div className="relative flex-1 items-center">
          <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground ml-3" />
          <Input
            className="block h-full w-full border-0 bg-muted py-0 pl-10 pr-0 text-foreground placeholder:text-muted-foreground focus:ring-0 sm:text-sm"
            placeholder="Search..."
            type="search"
          />
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "bw" ? "dark" : "bw")}
            title={theme === "bw" ? "Switch to dark theme" : "Switch to B&W theme"}
          >
            {theme === "bw" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Bell className="h-6 w-6" />
          </Button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />

          <div className="flex items-center gap-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/foto.jpg" />
              <AvatarFallback className="bg-primary/10 text-primary">SV</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-semibold leading-6 text-foreground lg:block">Stiven Valeriano</span>
          </div>
        </div>
      </div>
    </div>
  )
}
