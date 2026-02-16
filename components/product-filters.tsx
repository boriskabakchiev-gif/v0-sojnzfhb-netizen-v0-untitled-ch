"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Category {
  id: string
  title: string
}

interface Subcategory {
  id: string
  cateid: string
  title: string
}

interface ProductFiltersProps {
  categories: Category[]
  allSubcategories: Subcategory[]
  categoryId?: string
  subcategoryId?: string
  minPrice?: string
  maxPrice?: string
  sortOption: string
}

export function ProductFilters({
  categories,
  allSubcategories,
  categoryId,
  subcategoryId,
  minPrice,
  maxPrice,
  sortOption,
}: ProductFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [showSubcategories, setShowSubcategories] = useState(false)
  const [showPriceRanges, setShowPriceRanges] = useState(false)
  const [showSorting, setShowSorting] = useState(false)

  // Определяме активните филтри
  const hasActiveFilters = categoryId || subcategoryId || minPrice || maxPrice || sortOption !== "title-asc"
  const activeFiltersCount = [categoryId, subcategoryId, minPrice || maxPrice, sortOption !== "title-asc"].filter(
    Boolean,
  ).length

  return (
    <div className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        {/* Заглавие и бутон за показване/скриване на филтрите */}
        <div
          className="p-2 flex items-center justify-between cursor-pointer border-b border-gray-800"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="flex items-center">
            <SlidersHorizontal className="h-5 w-5 text-yellow-400 mr-2" />
            <h2 className="text-lg font-bold">Филтри</h2>
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" className="p-1">
            {showFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>

        {/* Съдържание на филтрите */}
        {showFilters && (
          <div className="p-3 space-y-3">
            {/* Категории */}
            <div className="border-b border-gray-800 pb-4">
              <div
                className="flex items-center justify-between cursor-pointer mb-2"
                onClick={() => setShowCategories(!showCategories)}
              >
                <h3 className="font-medium text-yellow-400">Категории</h3>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  {showCategories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {showCategories && (
                <div className="space-y-1 mt-2 pl-1">
                  <Link
                    href="/products"
                    className={`flex items-center px-2 py-1.5 rounded-md ${
                      !categoryId ? "bg-gray-800 text-yellow-400" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    {!categoryId && <Check className="h-4 w-4 mr-2 text-yellow-400" />}
                    <span className={!categoryId ? "ml-3 font-medium" : ""}>Всички категории</span>
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?${new URLSearchParams({
                        category: category.id,
                        ...(minPrice !== undefined && { minPrice: minPrice.toString() }),
                        ...(maxPrice !== undefined && { maxPrice: maxPrice.toString() }),
                        ...(sortOption !== "title-asc" && { sort: sortOption }),
                      }).toString()}`}
                      className={`flex items-center px-2 py-1.5 rounded-md ${
                        category.id === categoryId
                          ? "bg-gray-800 text-yellow-400"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      {category.id === categoryId && <Check className="h-4 w-4 mr-2 text-yellow-400" />}
                      <span className={category.id === categoryId ? "ml-3 font-medium" : ""}>{category.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Подкатегории (ако е избрана категория) */}
            {categoryId && (
              <div className="border-b border-gray-800 pb-4">
                <div
                  className="flex items-center justify-between cursor-pointer mb-2"
                  onClick={() => setShowSubcategories(!showSubcategories)}
                >
                  <h3 className="font-medium text-yellow-400">Подкатегории</h3>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    {showSubcategories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {showSubcategories && (
                  <div className="space-y-1 mt-2 pl-1">
                    <Link
                      href={`/products?${new URLSearchParams({
                        category: categoryId,
                        ...(minPrice !== undefined && { minPrice: minPrice.toString() }),
                        ...(maxPrice !== undefined && { maxPrice: maxPrice.toString() }),
                        ...(sortOption !== "title-asc" && { sort: sortOption }),
                      }).toString()}`}
                      className={`flex items-center px-2 py-1.5 rounded-md ${
                        !subcategoryId
                          ? "bg-gray-800 text-yellow-400"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      {!subcategoryId && <Check className="h-4 w-4 mr-2 text-yellow-400" />}
                      <span className={!subcategoryId ? "ml-3 font-medium" : ""}>Всички подкатегории</span>
                    </Link>

                    {allSubcategories
                      .filter((sub) => sub.cateid === categoryId)
                      .map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          href={`/products?${new URLSearchParams({
                            category: categoryId,
                            subcategory: subcategory.id,
                            ...(minPrice !== undefined && { minPrice: minPrice.toString() }),
                            ...(maxPrice !== undefined && { maxPrice: maxPrice.toString() }),
                            ...(sortOption !== "title-asc" && { sort: sortOption }),
                          }).toString()}`}
                          className={`flex items-center px-2 py-1.5 rounded-md ${
                            subcategory.id === subcategoryId
                              ? "bg-gray-800 text-yellow-400"
                              : "text-gray-300 hover:bg-gray-800 hover:text-white"
                          }`}
                        >
                          {subcategory.id === subcategoryId && <Check className="h-4 w-4 mr-2 text-yellow-400" />}
                          <span className={subcategory.id === subcategoryId ? "ml-3 font-medium" : ""}>
                            {subcategory.title}
                          </span>
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Ценови диапазон */}
            <div className="border-b border-gray-800 pb-4">
              <div
                className="flex items-center justify-between cursor-pointer mb-2"
                onClick={() => setShowPriceRanges(!showPriceRanges)}
              >
                <h3 className="font-medium text-yellow-400">Ценови диапазон</h3>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  {showPriceRanges ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {showPriceRanges && (
                <div className="space-y-2 mt-2 pl-1">
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(categoryId && { category: categoryId }),
                      ...(subcategoryId && { subcategory: subcategoryId }),
                      ...(sortOption !== "title-asc" && { sort: sortOption }),
                    }).toString()}`}
                    className={`flex items-center text-sm ${!minPrice && !maxPrice ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    {!minPrice && !maxPrice && <Check className="h-4 w-4 mr-2" />}
                    <span className={!minPrice && !maxPrice ? "ml-6" : ""}>Всички цени</span>
                  </Link>
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(categoryId && { category: categoryId }),
                      ...(subcategoryId && { subcategory: subcategoryId }),
                      minPrice: "0",
                      maxPrice: "50",
                      ...(sortOption !== "title-asc" && { sort: sortOption }),
                    }).toString()}`}
                    className={`flex items-center text-sm ${minPrice === "0" && maxPrice === "50" ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    {minPrice === "0" && maxPrice === "50" && <Check className="h-4 w-4 mr-2" />}
                    <span className={minPrice === "0" && maxPrice === "50" ? "ml-6" : ""}>До 50 лв.</span>
                  </Link>
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(categoryId && { category: categoryId }),
                      ...(subcategoryId && { subcategory: subcategoryId }),
                      minPrice: "50",
                      maxPrice: "100",
                      ...(sortOption !== "title-asc" && { sort: sortOption }),
                    }).toString()}`}
                    className={`flex items-center text-sm ${minPrice === "50" && maxPrice === "100" ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    {minPrice === "50" && maxPrice === "100" && <Check className="h-4 w-4 mr-2" />}
                    <span className={minPrice === "50" && maxPrice === "100" ? "ml-6" : ""}>50 - 100 лв.</span>
                  </Link>
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(categoryId && { category: categoryId }),
                      ...(subcategoryId && { subcategory: subcategoryId }),
                      minPrice: "100",
                      maxPrice: "200",
                      ...(sortOption !== "title-asc" && { sort: sortOption }),
                    }).toString()}`}
                    className={`flex items-center text-sm ${minPrice === "100" && maxPrice === "200" ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    {minPrice === "100" && maxPrice === "200" && <Check className="h-4 w-4 mr-2" />}
                    <span className={minPrice === "100" && maxPrice === "200" ? "ml-6" : ""}>100 - 200 лв.</span>
                  </Link>
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(categoryId && { category: categoryId }),
                      ...(subcategoryId && { subcategory: subcategoryId }),
                      minPrice: "200",
                      maxPrice: "500",
                      ...(sortOption !== "title-asc" && { sort: sortOption }),
                    }).toString()}`}
                    className={`flex items-center text-sm ${minPrice === "200" && maxPrice === "500" ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    {minPrice === "200" && maxPrice === "500" && <Check className="h-4 w-4 mr-2" />}
                    <span className={minPrice === "200" && maxPrice === "500" ? "ml-6" : ""}>200 - 500 лв.</span>
                  </Link>
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(categoryId && { category: categoryId }),
                      ...(subcategoryId && { subcategory: subcategoryId }),
                      minPrice: "500",
                      ...(sortOption !== "title-asc" && { sort: sortOption }),
                    }).toString()}`}
                    className={`flex items-center text-sm ${minPrice === "500" && !maxPrice ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    {minPrice === "500" && !maxPrice && <Check className="h-4 w-4 mr-2" />}
                    <span className={minPrice === "500" && !maxPrice ? "ml-6" : ""}>Над 500 лв.</span>
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
                <h3 className="font-medium text-yellow-400">Сортиране</h3>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  {showSorting ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {showSorting && (
                <div className="space-y-2 mt-2 pl-1">
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(categoryId && { category: categoryId }),
                      ...(subcategoryId && { subcategory: subcategoryId }),
                      ...(minPrice !== undefined && { minPrice: minPrice.toString() }),
                      ...(maxPrice !== undefined && { maxPrice: maxPrice.toString() }),
                      sort: "title-asc",
                    }).toString()}`}
                    className={`flex items-center text-sm ${sortOption === "title-asc" ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    {sortOption === "title-asc" && <Check className="h-4 w-4 mr-2" />}
                    <span className={sortOption === "title-asc" ? "ml-6" : ""}>Име (А-Я)</span>
                  </Link>
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(categoryId && { category: categoryId }),
                      ...(subcategoryId && { subcategory: subcategoryId }),
                      ...(minPrice !== undefined && { minPrice: minPrice.toString() }),
                      ...(maxPrice !== undefined && { maxPrice: maxPrice.toString() }),
                      sort: "title-desc",
                    }).toString()}`}
                    className={`flex items-center text-sm ${sortOption === "title-desc" ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    {sortOption === "title-desc" && <Check className="h-4 w-4 mr-2" />}
                    <span className={sortOption === "title-desc" ? "ml-6" : ""}>Име (Я-А)</span>
                  </Link>
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(categoryId && { category: categoryId }),
                      ...(subcategoryId && { subcategory: subcategoryId }),
                      ...(minPrice !== undefined && { minPrice: minPrice.toString() }),
                      ...(maxPrice !== undefined && { maxPrice: maxPrice.toString() }),
                      sort: "price-asc",
                    }).toString()}`}
                    className={`flex items-center text-sm ${sortOption === "price-asc" ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    {sortOption === "price-asc" && <Check className="h-4 w-4 mr-2" />}
                    <span className={sortOption === "price-asc" ? "ml-6" : ""}>Цена (ниска-висока)</span>
                  </Link>
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(categoryId && { category: categoryId }),
                      ...(subcategoryId && { subcategory: subcategoryId }),
                      ...(minPrice !== undefined && { minPrice: minPrice.toString() }),
                      ...(maxPrice !== undefined && { maxPrice: maxPrice.toString() }),
                      sort: "price-desc",
                    }).toString()}`}
                    className={`flex items-center text-sm ${sortOption === "price-desc" ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    {sortOption === "price-desc" && <Check className="h-4 w-4 mr-2" />}
                    <span className={sortOption === "price-desc" ? "ml-6" : ""}>Цена (висока-ниска)</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Бутон за изчистване на филтрите */}
            {hasActiveFilters && (
              <div className="pt-4 mt-4 border-t border-gray-800">
                <Link href="/products">
                  <Button
                    variant="outline"
                    className="w-full border-red-600 text-red-500 hover:bg-red-950 hover:text-red-400"
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
