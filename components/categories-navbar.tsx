"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

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

interface CategoriesNavbarProps {
  currentCategoryId?: string
  isEnglish?: boolean
  categories?: Category[]
  subcategories?: Subcategory[]
}

export function CategoriesNavbar({
  currentCategoryId,
  isEnglish = false,
  categories = [],
  subcategories = [],
}: CategoriesNavbarProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  const activeCategories = categories.filter((category) => !category.deleted && category.id && category.title)
  const activeSubcategories = subcategories.filter((sub) => !sub.deleted && sub.id)

  // Group subcategories by category
  const subcategoriesByCategory = activeSubcategories.reduce(
    (acc, sub) => {
      if (!acc[sub.cateid]) acc[sub.cateid] = []
      acc[sub.cateid].push(sub)
      return acc
    },
    {} as Record<string, Subcategory[]>
  )

  const handleMouseEnter = (categoryId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setHoveredCategory(categoryId)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (activeCategories.length === 0) {
    return (
      <div className="bg-neutral-950 fixed top-[56px] sm:top-[64px] left-0 right-0 w-full z-[9998] border-b border-white/[0.06]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center h-11">
            <span className="text-neutral-500 text-sm">
              {isEnglish ? "Loading categories..." : "Зареждане на категории..."}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div 
        ref={navRef}
        className="bg-neutral-950/95 backdrop-blur-xl fixed top-[56px] sm:top-[64px] left-0 right-0 w-full z-[9998] border-b border-white/[0.06]"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="hidden md:flex items-center gap-1 h-11 overflow-x-auto scrollbar-none">
            {activeCategories.map((category) => {
              const categoryTitle = isEnglish
                ? category.title_en || category.title
                : category.title
              const isActive = category.id === currentCategoryId
              const hasSubs = subcategoriesByCategory[category.id]?.length > 0
              const isHovered = hoveredCategory === category.id

              return (
                <div
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(category.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={isEnglish ? `/en/category/${category.id}` : `/category/${category.id}`}
                    className={`
                      relative flex items-center gap-1 flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium
                      transition-all duration-200 whitespace-nowrap
                      ${
                        isActive
                          ? "bg-white text-neutral-900"
                          : "text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                      }
                    `}
                  >
                    {categoryTitle}
                    {hasSubs && (
                      <ChevronDown 
                        className={`h-3 w-3 transition-transform duration-200 ${isHovered ? "rotate-180" : ""}`} 
                      />
                    )}
                  </Link>

                  {/* Subcategory Dropdown */}
                  {hasSubs && isHovered && (
                    <div 
                      className="absolute top-full left-0 pt-2 z-50"
                      onMouseEnter={() => handleMouseEnter(category.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200/60 overflow-hidden min-w-[220px] max-h-[70vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-150">
                        <div className="py-2">
                          {subcategoriesByCategory[category.id].map((sub) => {
                            const subTitle = isEnglish
                              ? sub.title_en || sub.title
                              : sub.title
                            return (
                              <Link
                                key={sub.id}
                                href={isEnglish ? `/en/subcategory/${sub.id}` : `/subcategory/${sub.id}`}
                                className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                              >
                                {subTitle}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile - Simple horizontal scroll without dropdowns */}
          <div className="flex md:hidden items-center gap-1 h-11 overflow-x-auto scrollbar-none">
            {activeCategories.map((category) => {
              const categoryTitle = isEnglish
                ? category.title_en || category.title
                : category.title
              const isActive = category.id === currentCategoryId

              return (
                <Link
                  key={category.id}
                  href={isEnglish ? `/en/category/${category.id}` : `/category/${category.id}`}
                  className={`
                    relative flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium
                    transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
                        ? "bg-white text-neutral-900"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                    }
                  `}
                >
                  {categoryTitle}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-11" />
    </>
  )
}
