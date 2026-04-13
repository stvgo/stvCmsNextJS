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
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Post[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  const hasActiveSearch = searchQuery.trim().length > 0

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    async function performSearch() {
      setIsSearching(true)
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
