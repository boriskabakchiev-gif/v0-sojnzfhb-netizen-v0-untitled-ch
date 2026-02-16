"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { ImageUpload } from "@/components/image-upload" // This component handles image uploads

interface Category {
  id: string
  title: string
  objectid?: string
}

interface Subcategory {
  id: string
  title: string
  cateid?: string
  objectid?: string
}

export default function AddProductPage() {
  const [formData, setFormData] = useState({
    title: "",
    title_en: "",
    description: "",
    description_en: "",
    price: "",
    wholesalerprice: "",
    retailerprice: "",
    europe_price: "",
    cateid: "",
    subcateid: "",
    photourl: "", // This will be populated by ImageUpload
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  // Зареждане на ВСИЧКИ категории без кеширане
  const fetchAllCategories = async () => {
    try {
      console.log("Fetching categories without cache...")
      const timestamp = Date.now()
      const response = await fetch(`/api/admin/categories?limit=1000&page=1&nocache=${timestamp}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Fresh categories fetched:", data)

      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories)
        console.log("Total categories loaded:", data.categories.length)
      } else {
        console.warn("No categories found in response")
        setCategories([])
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError("Грешка при зареждане на категориите.")
    }
  }

  // Зареждане на подкатегории за конкретна категория БЕЗ КЕШИРАНЕ
  const fetchSubcategoriesForCategory = async (categoryId: string) => {
    if (!categoryId || categoryId === "none") {
      setFilteredSubcategories([])
      return
    }

    try {
      setLoadingSubcategories(true)
      console.log(`Fetching subcategories for category: ${categoryId} without cache...`)

      const timestamp = Date.now()
      const response = await fetch(
        `/api/admin/subcategories?categoryId=${categoryId}&limit=1000&page=1&nocache=${timestamp}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Fresh subcategories fetched for category:", data)

      if (data.subcategories && Array.isArray(data.subcategories)) {
        setFilteredSubcategories(data.subcategories)
        console.log(`Total subcategories loaded for category ${categoryId}:`, data.subcategories.length)
      } else {
        console.warn("No subcategories found in response")
        setFilteredSubcategories([])
      }
    } catch (err) {
      console.error(`Error fetching subcategories for category ${categoryId}:`, err)
      setError("Грешка при зареждане на подкатегориите.")
      setFilteredSubcategories([])
    } finally {
      setLoadingSubcategories(false)
    }
  }

  // Зареждане на категориите при монтиране на компонента
  useEffect(() => {
    fetchAllCategories()
  }, [])

  // Зареждане на подкатегории при промяна на избраната категория
  useEffect(() => {
    if (formData.cateid && formData.cateid !== "none") {
      fetchSubcategoriesForCategory(formData.cateid)
    } else {
      setFilteredSubcategories([])
    }
  }, [formData.cateid])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Ако променяме категорията, нулираме избраната подкатегория
    if (name === "cateid") {
      setFormData((prev) => ({ ...prev, subcateid: "" }))
    }
  }

  const handleRefreshSubcategories = () => {
    console.log("Manual refresh of subcategories triggered")
    if (formData.cateid && formData.cateid !== "none") {
      fetchSubcategoriesForCategory(formData.cateid)
    }
  }

  const handleRefreshCategories = () => {
    console.log("Manual refresh of categories triggered")
    fetchAllCategories()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const timestamp = Date.now()
      const response = await fetch(`/api/admin/products/add?nocache=${timestamp}`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.success) {
        setSuccess("Продуктът беше добавен успешно!")
        // Изчистваме формата след успешно добавяне
        setFormData({
          title: "",
          title_en: "",
          description: "",
          description_en: "",
          price: "",
          wholesalerprice: "",
          retailerprice: "",
          europe_price: "",
          cateid: "",
          subcateid: "",
          photourl: "",
        })

        // Пренасочваме към списъка с продукти след кратко забавяне
        setTimeout(() => {
          router.push("/admin-panel/products")
        }, 2000)
      } else {
        setError(data.error || "Грешка при добавяне на продукта.")
      }
    } catch (err) {
      console.error("Error adding product:", err)
      const errorMessage =
        err instanceof Error ? err.message : "Грешка при добавяне на продукта. Моля, опитайте отново."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Добавяне на продукт</h1>
        <Button variant="outline" onClick={() => router.push("/admin-panel/products")}>
          Назад към продукти
        </Button>
      </div>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Информация за продукта</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-md mb-4">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Име на продукта *
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="title_en" className="text-sm font-medium">
                  Име на продукта - EU *
                </label>
                <Input
                  id="title_en"
                  name="title_en"
                  value={formData.title_en}
                  onChange={handleChange}
                  required
                  className="bg-white border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Описание
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="bg-white border-gray-300 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description_en" className="text-sm font-medium">
                  Описание - EU
                </label>
                <Textarea
                  id="description_en"
                  name="description_en"
                  value={formData.description_en}
                  onChange={handleChange}
                  className="bg-white border-gray-300 min-h-[100px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Цена *
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="europe_price" className="text-sm font-medium flex items-center">
                  <span className="mr-1">€</span> Цена за европейци
                </label>
                <Input
                  id="europe_price"
                  name="europe_price"
                  type="number"
                  step="0.01"
                  value={formData.europe_price}
                  onChange={handleChange}
                  className="bg-white border-gray-300"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="wholesalerprice" className="text-sm font-medium">
                  Цена на едро
                </label>
                <Input
                  id="wholesalerprice"
                  name="wholesalerprice"
                  type="number"
                  step="0.01"
                  value={formData.wholesalerprice}
                  onChange={handleChange}
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="retailerprice" className="text-sm font-medium">
                  Цена на дребно
                </label>
                <Input
                  id="retailerprice"
                  name="retailerprice"
                  type="number"
                  step="0.01"
                  value={formData.retailerprice}
                  onChange={handleChange}
                  className="bg-white border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="cateid" className="text-sm font-medium">
                    Категория ({categories.length} налични)
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshCategories}
                    className="h-6 px-2 text-xs bg-transparent"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span className="ml-1">Обнови</span>
                  </Button>
                </div>
                <Select value={formData.cateid} onValueChange={(value) => handleSelectChange("cateid", value)}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Изберете категория" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    <SelectItem value="none">Без категория</SelectItem>
                    {categories.map((category) => {
                      const categoryId = category.id || category.objectid
                      if (!categoryId) return null

                      return (
                        <SelectItem key={categoryId} value={categoryId}>
                          {category.title || "Категория без име"}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="subcateid" className="text-sm font-medium">
                    Подкатегория ({filteredSubcategories.length} налични)
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshSubcategories}
                    disabled={!formData.cateid || formData.cateid === "none" || loadingSubcategories}
                    className="h-6 px-2 text-xs bg-transparent"
                  >
                    {loadingSubcategories ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    <span className="ml-1">Обнови</span>
                  </Button>
                </div>
                <Select value={formData.subcateid} onValueChange={(value) => handleSelectChange("subcateid", value)}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue placeholder="Изберете подкатегория" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    <SelectItem value="none">Без подкатегория</SelectItem>
                    {loadingSubcategories ? (
                      <div className="flex items-center justify-center py-2">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        <span>Зареждане...</span>
                      </div>
                    ) : filteredSubcategories.length > 0 ? (
                      filteredSubcategories.map((subcategory) => {
                        const subcategoryId = subcategory.id || subcategory.objectid
                        if (!subcategoryId) return null

                        return (
                          <SelectItem key={subcategoryId} value={subcategoryId}>
                            {subcategory.title || "Подкатегория без име"}
                          </SelectItem>
                        )
                      })
                    ) : formData.cateid && formData.cateid !== "none" ? (
                      <SelectItem value="no-subcategories">Няма подкатегории за тази категория</SelectItem>
                    ) : (
                      <SelectItem value="select-category-first">Първо изберете категория</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="photourl" className="text-sm font-medium">
                Снимка на продукта
              </label>
              <ImageUpload
                currentImageUrl={formData.photourl}
                onImageUploaded={(url) => setFormData((prev) => ({ ...prev, photourl: url }))}
                onError={(error) => setError(error)}
                uploadUrl="/api/products/upload-image"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Добавяне...
                  </>
                ) : (
                  "Добави продукт"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
