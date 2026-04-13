"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { SearchProvider } from "@/contexts/search-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <SearchProvider>
      <div className="min-h-screen bg-background">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="lg:pl-72">
          <Header setSidebarOpen={setSidebarOpen} />

          <main className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </SearchProvider>
  )
}
