"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { type FormEvent, useState, useEffect, useRef } from "react"
import { Search, X, Loader2, ArrowRight, History } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

type SearchResult = {
  objectid: string
  title: string
  price: string
  photourl?: string
  description?: string
}

interface SearchFormProps {
  className?: string
  fullWidth?: boolean
}

export function SearchForm({ className = "", fullWidth = false }: SearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const storedSearches = localStorage.getItem("recentSearches")
    if (storedSearches) {
      try {
        setRecentSearches(JSON.parse(storedSearches).slice(0, 5))
      } catch (e) {
        console.error("Error parsing recent searches:", e)
      }
    }
  }, [])

  // Save a search term to recent searches
  const saveToRecentSearches = (term: string) => {
    if (!term.trim()) return

    const updatedSearches = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 5)

    setRecentSearches(updatedSearches)
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
  }

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDropdown) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prevIndex) => {
            const maxIndex = results.length > 0 ? results.length - 1 : recentSearches.length - 1
            return prevIndex < maxIndex ? prevIndex + 1 : prevIndex
          })
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : -1))
          break
        case "Enter":
          e.preventDefault()
          if (selectedIndex >= 0) {
            if (results.length > 0 && selectedIndex < results.length) {
              router.push(`/product/${results[selectedIndex].objectid}`)
              saveToRecentSearches(query)
              setShowDropdown(false)
            } else if (recentSearches.length > 0 && selectedIndex < recentSearches.length) {
              handleSearch(recentSearches[selectedIndex])
            }
          } else if (query.trim()) {
            handleSearch(query)
          }
          break
        case "Escape":
          setShowDropdown(false)
          setIsFocused(false)
          break
      }
    }

    if (showDropdown) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [showDropdown, selectedIndex, results, recentSearches, router, query])

  // Fetch search suggestions
  const fetchSearchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`)
      if (!response.ok) throw new Error("Failed to fetch suggestions")

      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error("Error fetching search suggestions:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    if (value.trim()) {
      setIsLoading(true)
      setShowDropdown(true)

      // Set new timeout
      debounceTimeout.current = setTimeout(() => {
        fetchSearchSuggestions(value)
      }, 300) // 300ms debounce
    } else {
      setResults([])
      setShowDropdown(isFocused) // Keep dropdown open if focused but show recent/popular
      setIsLoading(false)
    }
  }

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    saveToRecentSearches(searchQuery)
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    setShowDropdown(false)
    setIsFocused(false)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setShowDropdown(isFocused) // Keep dropdown open if focused but show recent/popular
    setIsLoading(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    setShowDropdown(true)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  return (
    <div className={cn("relative", fullWidth ? "w-full" : "w-full max-w-md", className)} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder="Търсене на продукти..."
          aria-label="Търсене на продукти"
          className={cn(
            "w-full px-4 py-2 pl-10 pr-10 rounded-full bg-gray-800 border border-gray-700 text-white",
            "placeholder:text-gray-400 placeholder:transition-opacity placeholder:duration-300",
            "focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent",
            "hover:border-gray-600 transition-all duration-200",
            isFocused && "ring-2 ring-yellow-500 border-transparent",
          )}
          autoComplete="off"
        />
        <Search
          className={cn(
            "absolute left-3 top-2.5 h-5 w-5 transition-colors duration-200",
            isFocused ? "text-yellow-500" : "text-gray-400",
          )}
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-12 top-2.5 text-gray-400 hover:text-gray-200 transition-colors duration-200"
            aria-label="Изчисти търсенето"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Променен бутон за търсене */}
        <button
          type="submit"
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center",
            "rounded-full bg-yellow-600 hover:bg-yellow-700 transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1",
          )}
          aria-label="Търси"
        >
          <Search className="h-4 w-4 text-white" />
        </button>
      </form>

      {/* Search Results Dropdown */}
      {showDropdown && (
        <div
          className={cn(
            "absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg",
            "max-h-[70vh] overflow-y-auto backdrop-blur-sm",
            "animate-in fade-in-50 slide-in-from-top-5 duration-200",
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
              <span className="ml-2 text-gray-300">Търсене...</span>
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="p-2 border-b border-gray-700">
                <p className="text-xs text-gray-400">Резултати от търсенето</p>
              </div>
              <ul className="divide-y divide-gray-700/50">
                {results.map((result, index) => (
                  <li key={result.objectid}>
                    <Link
                      href={`/product/${result.objectid}`}
                      className={cn(
                        "flex items-center p-3 hover:bg-gray-700/50 transition-colors",
                        index === selectedIndex ? "bg-gray-700/70" : "",
                      )}
                      onClick={() => {
                        saveToRecentSearches(query)
                        setShowDropdown(false)
                      }}
                    >
                      {result.photourl && (
                        <div className="flex-shrink-0 w-12 h-12 mr-3 bg-gray-700 rounded overflow-hidden">
                          <Image
                            src={result.photourl || "/placeholder.svg"}
                            alt={result.title}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{result.title}</p>
                        <p className="text-xs text-gray-400 truncate">{result.description?.substring(0, 60) || ""}</p>
                      </div>
                      <div className="ml-2 text-sm font-semibold text-yellow-500">{result.price} лв.</div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="p-2 border-t border-gray-700">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="flex items-center justify-center gap-1 text-center text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
                  onClick={() => {
                    saveToRecentSearches(query)
                    setShowDropdown(false)
                  }}
                >
                  <span>Вижте всички резултати</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center mb-2">
                    <History className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-xs text-gray-400">Последни търсения</p>
                  </div>
                  <ul className="space-y-1">
                    {recentSearches.map((term, index) => (
                      <li key={`recent-${index}`}>
                        <button
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded text-sm text-gray-300 hover:bg-gray-700/50 transition-colors",
                            index === selectedIndex ? "bg-gray-700/70" : "",
                          )}
                          onClick={() => handleSuggestionClick(term)}
                        >
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* No results message (only show if query exists) */}
              {query.trim() && (
                <div className="p-4 text-center border-t border-gray-700">
                  <p className="text-gray-300">Няма намерени резултати за "{query}"</p>
                  <p className="text-xs text-gray-500 mt-1">Опитайте с друга дума или фраза</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
