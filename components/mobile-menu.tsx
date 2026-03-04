"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, ChevronRight, Search, Loader2 } from "lucide-react"

interface Category {
  id: string
  title: string
  title_en?: string
  deleted?: boolean
}

interface Subcategory {
  id: string
  cateid: string
  title: string
  title_en?: string
  deleted?: boolean
}

interface MobileMenuProps {
  categories: Category[]
  subcategories?: Subcategory[]
  currentCategoryId?: string
  currentSubcategoryId?: string
  isEnglish?: boolean
}

type SearchResult = {
  objectid: string
  title: string
  price: string
  photourl?: string
  description?: string
}

export function MobileMenu({
  categories,
  subcategories = [],
  currentCategoryId,
  currentSubcategoryId,
  isEnglish = false,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [mounted, setMounted] = useState(false)
  const searchDebounceTimeout = useRef<NodeJS.Timeout | null>(null)

  const activeCategories = categories.filter((category) => !category.deleted && category.id)
  const activeSubcategories = subcategories.filter((subcategory) => !subcategory.deleted && subcategory.id)

  const subcategoriesByCategory = activeSubcategories.reduce(
    (acc, subcategory) => {
      if (!acc[subcategory.cateid]) acc[subcategory.cateid] = []
      acc[subcategory.cateid].push(subcategory)
      return acc
    },
    {} as Record<string, Subcategory[]>,
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      document.body.classList.add("mobile-menu-open")
    } else {
      document.body.style.overflow = "auto"
      document.body.classList.remove("mobile-menu-open")
    }
    return () => {
      document.body.style.overflow = "auto"
      document.body.classList.remove("mobile-menu-open")
    }
  }, [isOpen])

  const toggleCategoryExpand = (categoryId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const searchUrl = isEnglish
        ? `/en/search?q=${encodeURIComponent(searchQuery.trim())}`
        : `/search?q=${encodeURIComponent(searchQuery.trim())}`
      window.location.href = searchUrl
      setIsOpen(false)
    }
  }

  const fetchSearchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }
    try {
      setIsSearching(true)
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=5`)
      if (!response.ok) throw new Error("Failed to fetch suggestions")
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error("Error fetching search suggestions:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (searchDebounceTimeout.current) clearTimeout(searchDebounceTimeout.current)
    if (value.trim()) {
      setIsSearching(true)
      setShowSearchDropdown(true)
      searchDebounceTimeout.current = setTimeout(() => fetchSearchSuggestions(value), 300)
    } else {
      setSearchResults([])
      setShowSearchDropdown(false)
      setIsSearching(false)
    }
  }

  const getCategoryTitle = (category: Category) =>
    isEnglish ? category.title_en || category.title || "No name" : category.title || category.title_en || "Без име"

  const getSubcategoryTitle = (subcategory: Subcategory) =>
    isEnglish
      ? subcategory.title_en || subcategory.title || "No name"
      : subcategory.title || subcategory.title_en || "Без име"

  const getHomeUrl = () => (isEnglish ? "/en" : "/")
  const getCategoryUrl = (id: string) => (isEnglish ? `/en/category/${id}` : `/category/${id}`)
  const getSubcategoryUrl = (id: string) => (isEnglish ? `/en/subcategory/${id}` : `/subcategory/${id}`)
  const getProductUrl = (id: string) => (isEnglish ? `/en/product/${id}` : `/product/${id}`)
  const getSearchUrl = (q: string) =>
    isEnglish ? `/en/search?q=${encodeURIComponent(q)}` : `/search?q=${encodeURIComponent(q)}`

  const menuPanel = (
    <div className="fixed inset-0 md:hidden" style={{ zIndex: 99999 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Panel */}
      <div className="absolute inset-0 bg-neutral-900 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.06]">
          <Link href={getHomeUrl()} className="flex items-center" onClick={() => setIsOpen(false)}>
            <div className="relative h-9 w-28">
              <Image
                src="/images/design-mode/new-madiks.png"
                alt="Madix Groundbaits"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <button
            className="flex items-center justify-center h-8 w-8 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label={isEnglish ? "Close menu" : "Затвори меню"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder={isEnglish ? "Search products..." : "Търсене на продукти..."}
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
              className="w-full h-10 px-4 pl-10 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:bg-white/[0.10] focus:border-white/20 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />

            {showSearchDropdown && (
              <div className="absolute w-full mt-2 bg-neutral-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-h-[50vh] overflow-y-auto" style={{ zIndex: 100000 }}>
                {isSearching ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 text-neutral-400 animate-spin" />
                    <span className="ml-2 text-sm text-neutral-400">
                      {isEnglish ? "Searching..." : "Търсене..."}
                    </span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <div className="px-4 pt-3 pb-2">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                        {isEnglish ? "Results" : "Резултати"}
                      </p>
                    </div>
                    <ul>
                      {searchResults.map((result) => (
                        <li key={result.objectid}>
                          <Link
                            href={getProductUrl(result.objectid)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors"
                            onClick={() => {
                              setShowSearchDropdown(false)
                              setIsOpen(false)
                            }}
                          >
                            {result.photourl && (
                              <div className="flex-shrink-0 w-10 h-10 bg-white/[0.06] rounded-lg overflow-hidden">
                                <Image
                                  src={result.photourl || "/placeholder.svg"}
                                  alt={result.title}
                                  width={40}
                                  height={40}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{result.title}</p>
                              <p className="text-xs text-neutral-500 truncate">
                                {result.description?.substring(0, 60) || ""}
                              </p>
                            </div>
                            <div className="ml-2 text-sm font-semibold text-amber-400 tabular-nums">
                              {result.price} {isEnglish ? "BGN" : "лв."}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="px-4 py-3 border-t border-white/[0.06]">
                      <Link
                        href={getSearchUrl(searchQuery)}
                        className="block text-center text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
                        onClick={() => {
                          setShowSearchDropdown(false)
                          setIsOpen(false)
                        }}
                      >
                        {isEnglish ? "View all results" : "Вижте всички резултати"}
                      </Link>
                    </div>
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="px-4 py-5 text-center">
                    <p className="text-sm text-neutral-400">
                      {isEnglish ? "No results found" : "Няма намерени резултати"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {isEnglish ? "Try a different word or phrase" : "Опитайте с друга дума или фраза"}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </form>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-4 pb-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              {isEnglish ? "Categories" : "Категории"}
            </p>
          </div>
          <nav className="px-3 pb-4">
            <div className="space-y-0.5">
              {activeCategories.map((category) => {
                if (!category.id) return null
                const hasSubs = subcategoriesByCategory[category.id]?.length > 0

                return (
                  <div key={category.id}>
                    <div className="flex items-center">
                      <Link
                        href={getCategoryUrl(category.id)}
                        className={`flex-1 flex items-center px-3 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                          category.id === currentCategoryId
                            ? "bg-white/[0.08] text-white"
                            : "text-neutral-300 hover:bg-white/[0.05] hover:text-white"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {getCategoryTitle(category)}
                      </Link>
                      {hasSubs && (
                        <button
                          className="p-3 text-neutral-500 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors"
                          onClick={(e) => toggleCategoryExpand(category.id, e)}
                          aria-label={`Toggle subcategories for ${getCategoryTitle(category)}`}
                        >
                          {expandedCategories[category.id] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {expandedCategories[category.id] && hasSubs && (
                      <div className="ml-6 mt-0.5 mb-1 space-y-0.5 border-l border-white/[0.06] pl-3">
                        {subcategoriesByCategory[category.id].map((subcategory) => {
                          if (!subcategory.id) return null
                          return (
                            <Link
                              key={subcategory.id}
                              href={getSubcategoryUrl(subcategory.id)}
                              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                subcategory.id === currentSubcategoryId
                                  ? "text-white bg-white/[0.06]"
                                  : "text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200"
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              {getSubcategoryTitle(subcategory)}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-600">
              {"© "}{new Date().getFullYear()}{" Madix Groundbaits"}
            </p>
            <div className="relative h-8 w-8 opacity-50">
              <Image
                src="/images/design-mode/Eftta-Member-removebg.png"
                alt="EFTTA Member"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Hamburger button */}
      <button
        className="md:hidden flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        onClick={() => setIsOpen(true)}
        aria-label={isEnglish ? "Open menu" : "Отвори меню"}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Portal renders menu at document.body level, escaping header's stacking context */}
      {isOpen && mounted && createPortal(menuPanel, document.body)}
    </>
  )
}
