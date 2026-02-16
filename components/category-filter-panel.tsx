"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter, X } from "lucide-react"

interface CategoryFilterPanelProps {
  categoryId: string
  subcategories: Array<{
    id: string
    title: string
    title_en?: string
    displayTitle?: string
  }>
  currentSubcategoryId?: string
  minPrice?: string
  maxPrice?: string
  sortOption: string
  isEnglish?: boolean
}

// Helper function to get English title with fallback
function getEnglishTitle(item: { title_en?: string; title: string; displayTitle?: string }): string {
  if (item.displayTitle) return item.displayTitle
  return item.title_en && item.title_en.trim() !== "" ? item.title_en : item.title
}

export function CategoryFilterPanel({
  categoryId,
  subcategories,
  currentSubcategoryId,
  minPrice,
  maxPrice,
  sortOption,
  isEnglish = false,
}: CategoryFilterPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [localMinPrice, setLocalMinPrice] = useState(minPrice || "")
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || "")
  const [showFilters, setShowFilters] = useState(false)

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    const baseUrl = isEnglish ? `/en/category/${categoryId}` : `/category/${categoryId}`
    router.push(`${baseUrl}?${params.toString()}`)
  }

  const clearFilters = () => {
    setLocalMinPrice("")
    setLocalMaxPrice("")
    const baseUrl = isEnglish ? `/en/category/${categoryId}` : `/category/${categoryId}`
    router.push(baseUrl)
  }

  const applyPriceFilters = () => {
    updateFilters({
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
      subcategory: currentSubcategoryId,
      sort: sortOption,
    })
  }

  const hasActiveFilters = currentSubcategoryId || minPrice || maxPrice

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          {isEnglish ? "Filters" : "Филтри"}
        </Button>

        {subcategories.length > 0 && (
          <Select
            value={currentSubcategoryId || "all"}
            onValueChange={(value) =>
              updateFilters({
                subcategory: value === "all" ? undefined : value,
                minPrice,
                maxPrice,
                sort: sortOption,
              })
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={isEnglish ? "All subcategories" : "Всички подкategории"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isEnglish ? "All subcategories" : "Всички подкategории"}</SelectItem>
              {subcategories.map((subcategory) => {
                const displayTitle = isEnglish ? getEnglishTitle(subcategory) : subcategory.title
                return (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {displayTitle}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        )}

        <Select
          value={sortOption}
          onValueChange={(value) =>
            updateFilters({
              subcategory: currentSubcategoryId,
              minPrice,
              maxPrice,
              sort: value,
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title-asc">{isEnglish ? "Name A-Z" : "Име А-Я"}</SelectItem>
            <SelectItem value="title-desc">{isEnglish ? "Name Z-A" : "Име Я-А"}</SelectItem>
            <SelectItem value="price-asc">{isEnglish ? "Price: Low to High" : "Цена: Ниска към Висока"}</SelectItem>
            <SelectItem value="price-desc">{isEnglish ? "Price: High to Low" : "Цена: Висока към Ниска"}</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            {isEnglish ? "Clear filters" : "Изчисти филтри"}
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? "Price Range" : "Ценови диапазон"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="minPrice">{isEnglish ? "Min Price" : "Минимална цена"}</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maxPrice">{isEnglish ? "Max Price" : "Максимална цена"}</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="1000"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                />
              </div>
              <Button onClick={applyPriceFilters}>{isEnglish ? "Apply" : "Приложи"}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
