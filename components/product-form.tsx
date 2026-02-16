"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { addProduct, updateProduct } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Euro, Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { toast } from "@/components/ui/use-toast"

interface Category {
  id: string
  title: string
}

interface Subcategory {
  id: string
  title: string
}

interface ProductFormProps {
  categories: Category[]
  initialData?: any
  mode: "add" | "edit"
  onSaveSuccess?: () => void
}

const getSubcategoriesForCategory = async (categoryId: string) => {
  try {
    console.log(`Заявка за подкатегории на категория: ${categoryId}`)
    const response = await fetch(`/api/admin/subcategories?cateid=${categoryId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log(`Получени подкатегории:`, data.subcategories?.length || 0)
    return data.subcategories || []
  } catch (error) {
    console.error("Error fetching subcategories:", error)
    throw error
  }
}

export function ProductForm({ categories, initialData, mode, onSaveSuccess }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)

  const [formData, setFormData] = useState({
    id: initialData?.id || initialData?.objectid || initialData?.["Document ID"] || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    retailerprice: initialData?.retailerprice || "",
    wholesalerprice: initialData?.wholesalerprice || "",
    europe_price: initialData?.europe_price || "",
    cateid: initialData?.cateid || "",
    subcateid: initialData?.subcateid || "",
    photourl: initialData?.photourl || "",
    sku: initialData?.sku || "",
    barcode: initialData?.barcode || "",
    stock: initialData?.stock || 0,
    weight: initialData?.weight || 0,
    dimensions: initialData?.dimensions || "",
    active: initialData?.active !== undefined ? initialData.active : true,
  })

  const fetchSubcategories = useCallback(async (categoryId: string) => {
    if (!categoryId || categoryId === "") {
      console.log("Няма избрана категория, изчистване на подкатегории")
      setSubcategories([])
      return
    }

    setLoadingSubcategories(true)
    try {
      console.log(`Зареждане на подкатегории за категория: ${categoryId}`)
      const data = await getSubcategoriesForCategory(categoryId)
      console.log(`Заредени ${data.length} подкатегории`)
      setSubcategories(data || [])
    } catch (err) {
      console.error("Error fetching subcategories:", err)
      toast({
        title: "Грешка",
        description: "Неуспешно зареждане на подкатегории.",
        variant: "destructive",
      })
      setSubcategories([])
    } finally {
      setLoadingSubcategories(false)
    }
  }, [])

  useEffect(() => {
    setFormData({
      id: initialData?.id || initialData?.objectid || initialData?.["Document ID"] || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      price: initialData?.price || "",
      retailerprice: initialData?.retailerprice || "",
      wholesalerprice: initialData?.wholesalerprice || "",
      europe_price: initialData?.europe_price || "",
      cateid: initialData?.cateid || "",
      subcateid: initialData?.subcateid || "",
      photourl: initialData?.photourl || "",
      sku: initialData?.sku || "",
      barcode: initialData?.barcode || "",
      stock: initialData?.stock || 0,
      weight: initialData?.weight || 0,
      dimensions: initialData?.dimensions || "",
      active: initialData?.active !== undefined ? initialData.active : true,
    })
  }, [initialData])

  useEffect(() => {
    console.log(`useEffect: cateid променено на ${formData.cateid}`)
    if (formData.cateid && formData.cateid !== "") {
      fetchSubcategories(formData.cateid)
    } else {
      setSubcategories([])
      if (formData.subcateid) {
        setFormData((prev) => ({ ...prev, subcateid: "" }))
      }
    }
  }, [formData.cateid, fetchSubcategories])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    console.log(`Промяна в поле ${name}: ${value}`)

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    if (name === "cateid") {
      console.log(`Категория променена на: ${value}`)
      // Изчистваме подкатегорията когато се променя категорията
      setFormData((prev) => ({ ...prev, subcateid: "" }))
    }
  }

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, photourl: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload = { ...formData }
      payload.price = payload.price !== "" && payload.price !== null ? Number.parseFloat(String(payload.price)) : null
      payload.retailerprice =
        payload.retailerprice !== "" && payload.retailerprice !== null
          ? Number.parseFloat(String(payload.retailerprice))
          : null
      payload.wholesalerprice =
        payload.wholesalerprice !== "" && payload.wholesalerprice !== null
          ? Number.parseFloat(String(payload.wholesalerprice))
          : null
      payload.europe_price =
        payload.europe_price !== "" && payload.europe_price !== null
          ? Number.parseFloat(String(payload.europe_price))
          : null
      payload.stock = payload.stock !== "" && payload.stock !== null ? Number.parseInt(String(payload.stock), 10) : 0
      payload.weight = payload.weight !== "" && payload.weight !== null ? Number.parseFloat(String(payload.weight)) : 0

      if (payload.cateid === "") payload.cateid = null
      if (payload.subcateid === "") payload.subcateid = null

      let result

      if (mode === "add") {
        result = await addProduct(payload)
      } else {
        if (!payload.id) {
          setError("Липсва ID на продукта за обновяване.")
          setIsSubmitting(false)
          return
        }
        result = await updateProduct(payload)
      }

      if (result.success) {
        toast({
          title: "Успех!",
          description: mode === "add" ? "Продуктът е добавен успешно." : "Продуктът е обновен успешно.",
        })
        if (onSaveSuccess) {
          onSaveSuccess()
        } else {
          router.push("/admin-panel/products")
          router.refresh()
        }
      } else {
        setError(result.error || "Възникна грешка")
        toast({
          title: "Грешка",
          description: result.error || "Възникна грешка при запазване на продукта.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("Възникна неочаквана грешка")
      toast({
        title: "Грешка",
        description: "Възникна неочаквана грешка.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-md border border-red-500/20">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">
              Име на продукта <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="barcode">Баркод</Label>
              <Input
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stock">Наличност</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="weight">Тегло (кг)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="dimensions">Размери (ДxШxВ см)</Label>
              <Input
                id="dimensions"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="напр. 10x5x2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="photourl">URL на снимка</Label>
            <Input
              id="photourl"
              name="photourl"
              value={formData.photourl}
              onChange={handleChange}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <Label>Качване на снимка</Label>
            <ImageUpload onUpload={handleImageUpload} currentImageUrl={formData.photourl} productId={formData.id} />
          </div>

          {formData.photourl && (
            <div className="mt-2">
              <p className="text-sm text-gray-400 mb-2">Преглед на снимката:</p>
              <div className="w-32 h-32 bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                <img
                  src={formData.photourl || "/placeholder.svg?width=128&height=128&text=Preview"}
                  alt="Product preview"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "/placeholder.svg?width=128&height=128&text=Error"
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">
                Цена (лв) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="europe_price" className="flex items-center">
                <Euro className="h-4 w-4 mr-1 text-blue-400" />
                Цена в евро
              </Label>
              <Input
                id="europe_price"
                name="europe_price"
                type="number"
                step="0.01"
                value={formData.europe_price}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Цена за европейски клиенти"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="wholesalerprice">Цена на едро (лв)</Label>
              <Input
                id="wholesalerprice"
                name="wholesalerprice"
                type="number"
                step="0.01"
                value={formData.wholesalerprice}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="retailerprice">Цена на дребно (лв)</Label>
              <Input
                id="retailerprice"
                name="retailerprice"
                type="number"
                step="0.01"
                value={formData.retailerprice}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cateid">
              Категория <span className="text-red-500">*</span>
            </Label>
            <select
              id="cateid"
              name="cateid"
              value={formData.cateid}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Изберете категория</option>
              {categories &&
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <Label htmlFor="subcateid">Подкатегория</Label>
            <select
              id="subcateid"
              name="subcateid"
              value={formData.subcateid}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={!formData.cateid || loadingSubcategories}
            >
              <option value="">
                {loadingSubcategories
                  ? "Зареждане на подкатегории..."
                  : !formData.cateid
                    ? "Първо изберете категория"
                    : subcategories.length === 0
                      ? "Няма подкатегории за тази категория"
                      : "Изберете подкатегория"}
              </option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.title}
                </option>
              ))}
            </select>
            {formData.cateid && !loadingSubcategories && subcategories.length === 0 && (
              <p className="text-sm text-gray-400 mt-1">Няма налични подкатегории за тази категория.</p>
            )}
            {formData.cateid && subcategories.length > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                Намерени {subcategories.length} подкатегории за избраната категория.
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-offset-gray-900"
            />
            <Label htmlFor="active" className="font-medium text-white">
              Активен продукт
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onSaveSuccess) {
              onSaveSuccess()
            } else {
              router.push("/admin-panel/products")
            }
          }}
          disabled={isSubmitting}
          className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
        >
          Отказ
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Запазване...
            </>
          ) : mode === "add" ? (
            "Добави продукт"
          ) : (
            "Запази промените"
          )}
        </Button>
      </div>
    </form>
  )
}
