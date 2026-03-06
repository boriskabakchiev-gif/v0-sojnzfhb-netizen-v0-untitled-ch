"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Euro, Star, Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ProductImageUpload } from "@/components/product-image-upload" // Импортираме компонента за качване
import { StarRating } from "@/components/star-rating"

interface Category {
  id: string
  title: string
}

interface Subcategory {
  id: string
  title: string
}

interface Product {
  objectid: string
  title: string
  description?: string
  price?: number | string
  retailerprice?: number | string
  wholesalerprice?: number | string
  europe_price?: number | string
  cateid?: string
  subcateid?: string
  photourl?: string
  sku?: string
  barcode?: string
  stock?: number
  active?: boolean
  createdat?: string
  updated_at?: string
  deleted?: boolean
  [key: string]: any
}

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  categories: Category[]
  onProductUpdate: () => void
}

export function EditProductModal({ isOpen, onClose, product, categories, onProductUpdate }: EditProductModalProps) {
  const [formData, setFormData] = useState<Product | null>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddReview, setShowAddReview] = useState(false)
  const [newReviewRating, setNewReviewRating] = useState(5)
  const [newReviewName, setNewReviewName] = useState("")
  const [newReviewText, setNewReviewText] = useState("")
  const [addingReview, setAddingReview] = useState(false)

  useEffect(() => {
    if (product) {
      const initialFormData = JSON.parse(JSON.stringify(product))
      setFormData(initialFormData)
      if (initialFormData.cateid) {
        fetchSubcategories(initialFormData.cateid)
      } else {
        setSubcategories([])
      }
    } else {
      setFormData(null)
      setSubcategories([])
    }
  }, [product, isOpen])

  const fetchSubcategories = async (categoryId: string) => {
    if (!categoryId) {
      setSubcategories([])
      return
    }
    setLoadingSubcategories(true)
    try {
      const response = await fetch(`/api/admin/subcategories?cateid=${categoryId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.subcategories) {
          setSubcategories(data.subcategories)
        } else {
          setSubcategories([])
          toast({
            title: "Грешка при зареждане на подкатегории",
            description: data.error || "API отговорът не беше успешен.",
            variant: "destructive",
          })
        }
      } else {
        setSubcategories([])
        toast({
          title: "Грешка при мрежова заявка за подкатегории",
          description: `Статус: ${response.status}`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setSubcategories([])
      toast({
        title: "Грешка при извличане на подкатегории",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoadingSubcategories(false)
    }
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    if (!formData) return

    const updatedData = { ...formData, [fieldName]: value }
    setFormData(updatedData)

    if (fieldName === "cateid") {
      updatedData.subcateid = ""
      fetchSubcategories(value)
      setFormData(updatedData)
    }
  }

  const handleAddReview = async () => {
    if (!formData || newReviewRating === 0) return
    setAddingReview(true)
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: formData.objectid,
          rating: newReviewRating,
          reviewerName: newReviewName.trim() || null,
          reviewText: newReviewText.trim() || null,
        }),
      })
      const data = await response.json()
      if (data.success) {
        toast({
          title: "Успех",
          description: "Отзивът е добавен успешно.",
        })
        setShowAddReview(false)
        setNewReviewRating(5)
        setNewReviewName("")
        setNewReviewText("")
      } else {
        toast({
          title: "Грешка",
          description: data.error || "Неуспешно добавяне на отзив.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding review:", error)
      toast({
        title: "Грешка",
        description: "Възникна грешка при добавяне на отзива.",
        variant: "destructive",
      })
    } finally {
      setAddingReview(false)
    }
  }

  const handleFullSave = async () => {
    if (!formData) return
    setSaving(true)
    try {
      const payload: any = {
        id: formData.objectid,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        retailerprice: formData.retailerprice,
        wholesalerprice: formData.wholesalerprice,
        europe_price: formData.europe_price,
        cateid: formData.cateid,
        subcateid: formData.subcateid,
        photourl: formData.photourl,
        active: formData.active,
      }

      const response = await fetch("/api/admin/products/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Успех",
          description: result.message || "Продуктът е обновен успешно.",
        })
        onProductUpdate()
      } else {
        toast({
          title: "Грешка при запазване",
          description: result.error || "Неуспешно обновяване на продукта.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error during full product save:", error)
      toast({
        title: "Грешка",
        description: "Възникна грешка при запазване на всички промени по продукта.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !formData) return null

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            Редактиране на продукт
            {saving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Направете желаните промени и натиснете 'Запази всички промени'.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-grow py-4 pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400">Основна информация</h3>
              <div>
                <Label htmlFor="objectid">Object ID (readonly)</Label>
                <Input
                  id="objectid"
                  value={formData.objectid || ""}
                  disabled
                  className="bg-gray-800 border-gray-700 text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  rows={4}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku || ""}
                  onChange={(e) => handleFieldChange("sku", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={formData.barcode || ""}
                  onChange={(e) => handleFieldChange("barcode", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Ценообразуване</h3>
              <div>
                <Label htmlFor="price">Price (лв)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price === null || formData.price === undefined ? "" : formData.price}
                  onChange={(e) =>
                    handleFieldChange("price", e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="retailerprice">Retailer Price (лв)</Label>
                <Input
                  id="retailerprice"
                  type="number"
                  step="0.01"
                  value={
                    formData.retailerprice === null || formData.retailerprice === undefined
                      ? ""
                      : formData.retailerprice
                  }
                  onChange={(e) =>
                    handleFieldChange("retailerprice", e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="wholesalerprice">Wholesaler Price (лв)</Label>
                <Input
                  id="wholesalerprice"
                  type="number"
                  step="0.01"
                  value={
                    formData.wholesalerprice === null || formData.wholesalerprice === undefined
                      ? ""
                      : formData.wholesalerprice
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      "wholesalerprice",
                      e.target.value === "" ? null : Number.parseFloat(e.target.value),
                    )
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="europe_price" className="flex items-center">
                  <Euro className="h-4 w-4 mr-1" />
                  Europe Price (€)
                </Label>
                <Input
                  id="europe_price"
                  type="number"
                  step="0.01"
                  value={
                    formData.europe_price === null || formData.europe_price === undefined ? "" : formData.europe_price
                  }
                  onChange={(e) =>
                    handleFieldChange("europe_price", e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            {/* Categories & Inventory */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-400">Категории и наличност</h3>
              <div>
                <Label htmlFor="cateid">Category ID</Label>
                <select
                  id="cateid"
                  value={formData.cateid || ""}
                  onChange={(e) => handleFieldChange("cateid", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Изберете категория</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title} ({category.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="subcateid">Subcategory ID</Label>
                <select
                  id="subcateid"
                  value={formData.subcateid || ""}
                  onChange={(e) => handleFieldChange("subcateid", e.target.value)}
                  disabled={!formData.cateid || loadingSubcategories}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <option value="">{loadingSubcategories ? "Зареждане..." : "Изберете подкатегория"}</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.title} ({subcategory.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock === null || formData.stock === undefined ? "" : formData.stock}
                  onChange={(e) =>
                    handleFieldChange("stock", e.target.value === "" ? null : Number.parseInt(e.target.value, 10))
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            {/* Media & Status */}
            <div className="space-y-4 md:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-semibold text-orange-400">Медия и статус</h3>
              <div>
                <Label>Снимка на продукта</Label>
                <ProductImageUpload
                  productId={formData.objectid}
                  currentImageUrl={formData.photourl}
                  onImageUploaded={(newUrl) => {
                    handleFieldChange("photourl", newUrl)
                    toast({
                      title: "Снимката е обновена",
                      description: "Новият URL на снимката е записан във формата.",
                    })
                  }}
                />
              </div>
              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active || false}
                  onChange={(e) => handleFieldChange("active", e.target.checked)}
                  className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="deleted"
                  checked={formData.deleted || false}
                  onChange={(e) => handleFieldChange("deleted", e.target.checked)}
                  className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                />
                <Label htmlFor="deleted">Deleted</Label>
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-400">Timestamps</h3>
              <div>
                <Label htmlFor="createdat">Created At (readonly)</Label>
                <Input
                  id="createdat"
                  value={formData.createdat ? new Date(formData.createdat).toLocaleString("bg-BG") : ""}
                  disabled
                  className="bg-gray-800 border-gray-700 text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="updated_at">Updated At (readonly)</Label>
                <Input
                  id="updated_at"
                  value={formData.updated_at ? new Date(formData.updated_at).toLocaleString("bg-BG") : ""}
                  disabled
                  className="bg-gray-800 border-gray-700 text-gray-400"
                />
              </div>
            </div>

            {/* Add Review Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Отзиви
              </h3>
              {!showAddReview ? (
                <Button
                  type="button"
                  onClick={() => setShowAddReview(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добави отзив
                </Button>
              ) : (
                <div className="space-y-3 p-4 bg-gray-800 rounded-lg">
                  <div>
                    <Label>Оценка</Label>
                    <StarRating
                      rating={newReviewRating}
                      interactive
                      onRatingChange={setNewReviewRating}
                      size="lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviewerName">Име на рецензента</Label>
                    <Input
                      id="reviewerName"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      placeholder="Въведете име"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviewText">Текст на отзива</Label>
                    <Textarea
                      id="reviewText"
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Въведете текст на отзива"
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleAddReview}
                      disabled={addingReview || newReviewRating === 0}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {addingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Запази отзива
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddReview(false)
                        setNewReviewRating(5)
                        setNewReviewName("")
                        setNewReviewText("")
                      }}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Отказ
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800 flex justify-end space-x-2">
          <Button
            type="button"
            onClick={handleFullSave}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Запази всички промени
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            Затвори
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
