"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useDebounce } from "@/hooks/use-utils"
import { searchPosts, getPosts } from "@/lib/api"
import type { Post } from "@/types/post"

interface SearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: Post[]
  isSearching: boolean
  hasActiveSearch: boolean
  clearSearch: () => void
  isPending: boolean
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Post[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)

  // User has typed something
  const hasActiveSearch = searchQuery.trim().length > 0

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      if (!searchQuery.trim()) {
        setSearchResults([])
        setIsSearching(false)
      }
      return
    }

    setIsSearching(true)

    async function performSearch() {
      try {
        const results = await searchPosts(debouncedSearch)
        setSearchResults(results)
      } catch (error) {
        console.error("Search failed:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedSearch])

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setIsSearching(false)
  }

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        hasActiveSearch,
        clearSearch,
        isPending: searchQuery !== debouncedSearch && searchQuery.trim().length > 0,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}
