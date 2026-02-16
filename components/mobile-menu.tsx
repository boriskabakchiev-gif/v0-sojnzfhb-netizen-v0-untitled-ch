"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, ChevronRight, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const searchDebounceTimeout = useRef<NodeJS.Timeout | null>(null)

  // Филтрираме само активните категории и подкатегории
  const activeCategories = categories.filter((category) => !category.deleted && category.id)
  const activeSubcategories = subcategories.filter((subcategory) => !subcategory.deleted && subcategory.id)

  // Групираме подкатегориите по категория
  const subcategoriesByCategory = activeSubcategories.reduce(
    (acc, subcategory) => {
      if (!acc[subcategory.cateid]) {
        acc[subcategory.cateid] = []
      }
      acc[subcategory.cateid].push(subcategory)
      return acc
    },
    {} as Record<string, Subcategory[]>,
  )

  // Затваряме менюто при промяна на размера на екрана
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Предотвратяваме скролиране на страницата, когато менюто е отворено
  // и добавяме клас към body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      document.body.classList.add("mobile-menu-open")
    } else {
      document.body.style.overflow = "auto"
      document.body.classList.remove("mobile-menu-open")
    }

    // Cleanup функция, за да сме сигурни, че класът се премахва
    return () => {
      document.body.style.overflow = "auto"
      document.body.classList.remove("mobile-menu-open")
    }
  }, [isOpen])

  // Функция за превключване на разширяването на категория
  const toggleCategoryExpand = (categoryId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  // Функция за търсене
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

  // Fetch search suggestions
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

  // Handle input change with debounce
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    // Clear previous timeout
    if (searchDebounceTimeout.current) {
      clearTimeout(searchDebounceTimeout.current)
    }

    if (value.trim()) {
      setIsSearching(true)
      setShowSearchDropdown(true)

      // Set new timeout
      searchDebounceTimeout.current = setTimeout(() => {
        fetchSearchSuggestions(value)
      }, 300)
    } else {
      setSearchResults([])
      setShowSearchDropdown(false)
      setIsSearching(false)
    }
  }

  // Helper function to get category title based on language
  const getCategoryTitle = (category: Category) => {
    if (isEnglish) {
      return category.title_en || category.title || "No name"
    }
    return category.title || category.title_en || "Без име"
  }

  // Helper function to get subcategory title based on language
  const getSubcategoryTitle = (subcategory: Subcategory) => {
    if (isEnglish) {
      return subcategory.title_en || subcategory.title || "No name"
    }
    return subcategory.title || subcategory.title_en || "Без име"
  }

  // Helper function to get home URL based on language
  const getHomeUrl = () => {
    return isEnglish ? "/en" : "/"
  }

  // Helper function to get category URL based on language
  const getCategoryUrl = (categoryId: string) => {
    return isEnglish ? `/en/category/${categoryId}` : `/category/${categoryId}`
  }

  // Helper function to get subcategory URL based on language
  const getSubcategoryUrl = (subcategoryId: string) => {
    return isEnglish ? `/en/subcategory/${subcategoryId}` : `/subcategory/${subcategoryId}`
  }

  // Helper function to get product URL based on language
  const getProductUrl = (productId: string) => {
    return isEnglish ? `/en/product/${productId}` : `/product/${productId}`
  }

  // Helper function to get search URL based on language
  const getSearchUrl = (query: string) => {
    return isEnglish ? `/en/search?q=${encodeURIComponent(query)}` : `/search?q=${encodeURIComponent(query)}`
  }

  return (
    <>
      {/* Бутон за хамбургер меню */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-gray-100 hover:text-white"
        onClick={() => setIsOpen(true)}
        aria-label={isEnglish ? "Open menu" : "Отвори меню"}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Мобилно меню на цял екран */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black md:hidden mobile-menu-backdrop">
          <div className="fixed inset-0 bg-gray-800 flex flex-col h-full mobile-menu-panel overflow-hidden">
            {/* Хедър на менюто */}
            <div className="flex items-center justify-between p-4 border-b border-gray-600 bg-gray-700">
              <Link href={getHomeUrl()} className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                <div className="relative h-12 w-36">
                  <Image
                    src="/images/design-mode/new-madiks.png"
                    alt="Madix Groundbaits"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white"
                onClick={() => setIsOpen(false)}
                aria-label={isEnglish ? "Close menu" : "Затвори меню"}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            {/* Търсене */}
            <div className="p-4 border-b border-gray-600 bg-gray-700">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder={isEnglish ? "Search products..." : "Търсене на продукти..."}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                  className="w-full px-4 py-3 pl-10 pr-4 rounded-md bg-gray-600 border border-gray-500 text-white 
                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />

                {/* Search Results Dropdown */}
                {showSearchDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-[60vh] overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                        <span className="ml-2 text-gray-400">{isEnglish ? "Searching..." : "Търсене..."}</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div>
                        <div className="p-2 border-b border-gray-600">
                          <p className="text-xs text-gray-400">
                            {isEnglish ? "Search results" : "Резултати от търсенето"}
                          </p>
                        </div>
                        <ul>
                          {searchResults.map((result) => (
                            <li key={result.objectid}>
                              <Link
                                href={getProductUrl(result.objectid)}
                                className="flex items-center p-3 hover:bg-gray-600 transition-colors"
                                onClick={() => {
                                  setShowSearchDropdown(false)
                                  setIsOpen(false)
                                }}
                              >
                                {result.photourl && (
                                  <div className="flex-shrink-0 w-10 h-10 mr-3 bg-gray-600 rounded overflow-hidden">
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
                                  <p className="text-xs text-gray-400 truncate">
                                    {result.description?.substring(0, 60) || ""}
                                  </p>
                                </div>
                                <div className="ml-2 text-sm font-semibold text-amber-500">
                                  {result.price} {isEnglish ? "BGN" : "лв."}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <div className="p-2 border-t border-gray-600">
                          <Link
                            href={getSearchUrl(searchQuery)}
                            className="block text-center text-sm text-amber-500 hover:text-amber-400 transition-colors"
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
                      <div className="p-4 text-center">
                        <p className="text-gray-400">{isEnglish ? "No results found" : "Няма намерени резултати"}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {isEnglish ? "Try a different word or phrase" : "Опитайте с друга дума или фраза"}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </form>
            </div>
            {/* Навигационни линкове */}
            <div className="flex-1 overflow-y-auto py-2 bg-gradient-to-b from-gray-800 to-gray-900">
              <nav className="flex flex-col">
                <h2 className="px-4 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  {isEnglish ? "Categories" : "Категории"}
                </h2>
                <div className="space-y-1 px-2">
                  {activeCategories.map((category) => {
                    if (!category.id) {
                      console.warn("Категория без ID в мобилното меню:", category)
                      return null
                    }
                    return (
                      <div key={category.id} className="rounded-md overflow-hidden">
                        <div className="flex items-center">
                          <Link
                            href={getCategoryUrl(category.id)}
                            className={`flex-1 flex items-center px-3 py-3 rounded-md ${
                              category.id === currentCategoryId
                                ? "bg-gray-700 text-yellow-400"
                                : "text-gray-200 hover:bg-gray-700 hover:text-white"
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <span>{getCategoryTitle(category)}</span>
                          </Link>
                          {subcategoriesByCategory[category.id]?.length > 0 && (
                            <button
                              className="p-3 text-gray-400 hover:text-white rounded-md hover:bg-gray-700"
                              onClick={(e) => toggleCategoryExpand(category.id, e)}
                              aria-label={`${
                                expandedCategories[category.id]
                                  ? isEnglish
                                    ? "Hide"
                                    : "Скрий"
                                  : isEnglish
                                    ? "Show"
                                    : "Покажи"
                              } ${isEnglish ? "subcategories for" : "подкатегории за"} ${getCategoryTitle(category)}`}
                            >
                              {expandedCategories[category.id] ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                            </button>
                          )}
                        </div>

                        {expandedCategories[category.id] && subcategoriesByCategory[category.id]?.length > 0 && (
                          <div className="ml-11 mt-1 mb-2 space-y-1 border-l-2 border-gray-700 pl-2">
                            {subcategoriesByCategory[category.id].map((subcategory) => {
                              if (!subcategory.id) {
                                console.warn("Подкатегория без ID:", subcategory)
                                return null
                              }
                              return (
                                <Link
                                  key={subcategory.id}
                                  href={getSubcategoryUrl(subcategory.id)}
                                  className={`block px-3 py-2 rounded-md text-sm ${
                                    subcategory.id === currentSubcategoryId
                                      ? "text-yellow-400 bg-gray-700"
                                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                  }`}
                                  onClick={() => setIsOpen(false)}
                                >
                                  <span>{getSubcategoryTitle(subcategory)}</span>
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
            {/* Футър на менюто */}
            <div className="p-4 border-t border-gray-600 bg-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <p className="text-left">
                  © {new Date().getFullYear()} Madix Groundbaits.{" "}
                  {isEnglish ? "All rights reserved." : "Всички права запазени."}
                </p>
                <div className="flex-shrink-0 ml-2">
                  <Image
                    src="/images/design-mode/Eftta-Member-removebg.png"
                    alt="EFTTA Member Logo"
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
