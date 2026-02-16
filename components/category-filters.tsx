"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Subcategory {
  id: string
  cateid: string
  title: string
}

interface CategoryFiltersProps {
  categoryId: string
  subcategories: Subcategory[]
  currentSubcategoryId?: string
  minPrice?: string
  maxPrice?: string
  sortOption: string
}

export function CategoryFilters({
  categoryId,
  subcategories,
  currentSubcategoryId,
  minPrice,
  maxPrice,
  sortOption,
}: CategoryFiltersProps) {
  const [showFilters, setShowFilters] = useState(true) // Default to open on desktop
  const [showSubcategories, setShowSubcategories] = useState(true) // Default to open
  const [showPriceRanges, setShowPriceRanges] = useState(true) // Default to open
  const [showSorting, setShowSorting] = useState(true) // Default to open

  // Определяме активните филтри
  const hasActiveFilters = currentSubcategoryId || minPrice || maxPrice || sortOption !== "title-asc"
  const activeFiltersCount = [currentSubcategoryId, minPrice || maxPrice, sortOption !== "title-asc"].filter(
    Boolean,
  ).length

  // Helper function to create URL with filters
  const createFilterUrl = (params: {
    subcategory?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
  }) => {
    const urlParams = new URLSearchParams()

    if (params.subcategory) {
      urlParams.set("subcategory", params.subcategory)
    }

    if (params.minPrice) {
      urlParams.set("minPrice", params.minPrice)
    }

    if (params.maxPrice) {
      urlParams.set("maxPrice", params.maxPrice)
    }

    if (params.sort && params.sort !== "title-asc") {
      urlParams.set("sort", params.sort)
    }

    const queryString = urlParams.toString()
    return `/category/${categoryId}${queryString ? `?${queryString}` : ""}`
  }

  return (
    <div className="w-full lg:w-64 flex-shrink-0 mt-0">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
        {/* Заглавие и бутон за показване/скриване на филтрите */}
        <div
          className="p-2 flex items-center justify-between cursor-pointer border-b border-gray-200 hover:bg-gray-50"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="flex items-center">
            <SlidersHorizontal className="h-5 w-5 text-red-600 mr-2" />
            <h2 className="text-lg font-bold text-gray-800">Филтри</h2>
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" className="p-1 text-gray-600 hover:text-gray-800">
            {showFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>

        {/* Съдържание на филтрите */}
        {showFilters && (
          <div className="p-3 space-y-3">
            {/* Подкатегории */}
            <div className="border-b border-gray-200 pb-4">
              <div
                className="flex items-center justify-between cursor-pointer mb-2"
                onClick={() => setShowSubcategories(!showSubcategories)}
              >
                <h3 className="font-medium text-red-600">Подкатегории</h3>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-gray-600 hover:text-gray-800">
                  {showSubcategories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {showSubcategories && (
                <div className="space-y-1 mt-2 pl-1">
                  <Link
                    href={createFilterUrl({
                      minPrice,
                      maxPrice,
                      sort: sortOption,
                    })}
                    className={`flex items-center px-2 py-1.5 rounded-md ${
                      !currentSubcategoryId
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {!currentSubcategoryId && <Check className="h-4 w-4 mr-2 text-red-600" />}
                    <span className={!currentSubcategoryId ? "ml-3 font-medium" : ""}>Всички подкатегории</span>
                  </Link>

                  {subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.id}
                      href={createFilterUrl({
                        subcategory: subcategory.id,
                        minPrice,
                        maxPrice,
                        sort: sortOption,
                      })}
                      className={`flex items-center px-2 py-1.5 rounded-md ${
                        subcategory.id === currentSubcategoryId
                          ? "bg-red-50 text-red-600"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {subcategory.id === currentSubcategoryId && <Check className="h-4 w-4 mr-2 text-red-600" />}
                      <span className={subcategory.id === currentSubcategoryId ? "ml-3 font-medium" : ""}>
                        {subcategory.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Ценови диапазон */}
            <div className="border-b border-gray-200 pb-4">
              <div
                className="flex items-center justify-between cursor-pointer mb-2"
                onClick={() => setShowPriceRanges(!showPriceRanges)}
              >
                <h3 className="font-medium text-red-600">Ценови диапазон</h3>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-gray-600 hover:text-gray-800">
                  {showPriceRanges ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {showPriceRanges && (
                <div className="space-y-2 mt-2 pl-1">
                  <Link
                    href={createFilterUrl({
                      subcategory: currentSubcategoryId,
                      sort: sortOption,
                    })}
                    className={`flex items-center text-sm ${!minPrice && !maxPrice ? "text-red-600" : "text-gray-700 hover:text-gray-900"}`}
                  >
                    {!minPrice && !maxPrice && <Check className="h-4 w-4 mr-2" />}
                    <span className={!minPrice && !maxPrice ? "ml-6 font-medium" : ""}>Всички цени</span>
                  </Link>
                  <Link
                    href={createFilterUrl({
                      subcategory: currentSubcategoryId,
                      minPrice: "0",
                      maxPrice: "50",
                      sort: sortOption,
                    })}
                    className={`flex items-center text-sm ${minPrice === "0" && maxPrice === "50" ? "text-red-600" : "text-gray-700 hover:text-gray-900"}`}
                  >
                    {minPrice === "0" && maxPrice === "50" && <Check className="h-4 w-4 mr-2" />}
                    <span className={minPrice === "0" && maxPrice === "50" ? "ml-6 font-medium" : ""}>До 50 лв.</span>
                  </Link>
                  <Link
                    href={createFilterUrl({
                      subcategory: currentSubcategoryId,
                      minPrice: "50",
                      maxPrice: "100",
                      sort: sortOption,
                    })}
                    className={`flex items-center text-sm ${minPrice === "50" && maxPrice === "100" ? "text-red-600" : "text-gray-700 hover:text-gray-900"}`}
                  >
                    {minPrice === "50" && maxPrice === "100" && <Check className="h-4 w-4 mr-2" />}
                    <span className={minPrice === "50" && maxPrice === "100" ? "ml-6 font-medium" : ""}>
                      50 - 100 лв.
                    </span>
                  </Link>
                  <Link
                    href={createFilterUrl({
                      subcategory: currentSubcategoryId,
                      minPrice: "100",
                      maxPrice: "200",
                      sort: sortOption,
                    })}
                    className={`flex items-center text-sm ${minPrice === "100" && maxPrice === "200" ? "text-red-600" : "text-gray-700 hover:text-gray-900"}`}
                  >
                    {minPrice === "100" && maxPrice === "200" && <Check className="h-4 w-4 mr-2" />}
                    <span className={minPrice === "100" && maxPrice === "200" ? "ml-6 font-medium" : ""}>
                      100 - 200 лв.
                    </span>
                  </Link>
                  <Link
                    href={createFilterUrl({
                      subcategory: currentSubcategoryId,
                      minPrice: "200",
                      maxPrice: "500",
                      sort: sortOption,
                    })}
                    className={`flex items-center text-sm ${minPrice === "200" && maxPrice === "500" ? "text-red-600" : "text-gray-700 hover:text-gray-900"}`}
                  >
                    {minPrice === "200" && maxPrice === "500" && <Check className="h-4 w-4 mr-2" />}
                    <span className={minPrice === "200" && maxPrice === "500" ? "ml-6 font-medium" : ""}>
                      200 - 500 лв.
                    </span>
                  </Link>
                  <Link
                    href={createFilterUrl({
                      subcategory: currentSubcategoryId,
                      minPrice: "500",
                      sort: sortOption,
                    })}
                    className={`flex items-center text-sm ${minPrice === "500" && !maxPrice ? "text-red-600" : "text-gray-700 hover:text-gray-900"}`}
                  >
                    {minPrice === "500" && !maxPrice && <Check className="h-4 w-4 mr-2" />}
                    <span className={minPrice === "500" && !maxPrice ? "ml-6 font-medium" : ""}>Над 500 лв.</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Сортиране */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer mb-2"
                onClick={() => setShowSorting(!showSorting)}
              >
                <h3 className="font-medium text-red-600">Сортиране</h3>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-gray-600 hover:text-gray-800">
                  {showSorting ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {showSorting && (
                <div className="space-y-2 mt-2 pl-1">
                  <Link
                    href={createFilterUrl({
                      subcategory: currentSubcategoryId,
                      minPrice,
                      maxPrice,
                      sort: "title-asc",
                    })}
                    className={`flex items-center text-sm ${sortOption === "title-asc" ? "text-red-600" : "text-gray-700 hover:text-gray-900"}`}
                  >
                    {sortOption === "title-asc" && <Check className="h-4 w-4 mr-2" />}
                    <span className={sortOption === "title-asc" ? "ml-6 font-medium" : ""}>Име (А-Я)</span>
                  </Link>
                  <Link
                    href={createFilterUrl({
                      subcategory: currentSubcategoryId,
                      minPrice,
                      maxPrice,
                      sort: "title-desc",
                    })}
                    className={`flex items-center text-sm ${sortOption === "title-desc" ? "text-red-600" : "text-gray-700 hover:text-gray-900"}`}
                  >
                    {sortOption === "title-desc" && <Check className="h-4 w-4 mr-2" />}
                    <span className={sortOption === "title-desc" ? "ml-6 font-medium" : ""}>Име (Я-А)</span>
                  </Link>
                  <Link
                    href={createFilterUrl({
                      subcategory: currentSubcategoryId,
                      minPrice,
                      maxPrice,
                      sort: "price-asc",
                    })}
                    className={`flex items-center text-sm ${sortOption === "price-asc" ? "text-red-600" : "text-gray-700 hover:text-gray-900"}`}
                  >
                    {sortOption === "price-asc" && <Check className="h-4 w-4 mr-2" />}
                    <span className={sortOption === "price-asc" ? "ml-6 font-medium" : ""}>Цена (ниска-висока)</span>
                  </Link>
                  <Link
                    href={createFilterUrl({
                      subcategory: currentSubcategoryId,
                      minPrice,
                      maxPrice,
                      sort: "price-desc",
                    })}
                    className={`flex items-center text-sm ${sortOption === "price-desc" ? "text-red-600" : "text-gray-700 hover:text-gray-900"}`}
                  >
                    {sortOption === "price-desc" && <Check className="h-4 w-4 mr-2" />}
                    <span className={sortOption === "price-desc" ? "ml-6 font-medium" : ""}>Цена (висока-ниска)</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Бутон за изчистване на филтрите */}
            {hasActiveFilters && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <Link href={`/category/${categoryId}`}>
                  <Button
                    variant="outline"
                    className="w-full border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Изчисти всички филтри
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
