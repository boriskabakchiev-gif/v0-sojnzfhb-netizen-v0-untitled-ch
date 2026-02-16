"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { X, ArrowUpDown } from 'lucide-react'
import { getCurrentEmployee } from "@/lib/production-auth"

interface ProductionLine {
  id: number
  name: string
}

interface Employee {
  id: number
  name: string
}

interface Product {
  id: string
  name: string
  price?: number
  description?: string
  type: "online" | "production"
  production_line_id?: number // Added production_line_id to track which line the product belongs to
}

interface ProductionFormProps {
  productionLines: ProductionLine[]
  partners: any[]
  onClose: () => void
  onSuccess: () => void
}

export function ProductionForm({ productionLines, onClose, onSuccess }: ProductionFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [localProductionLines, setLocalProductionLines] = useState<ProductionLine[]>(productionLines)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState({
    productionLineId: "",
    productId: "",
    partnerEmployeeId: "",
    quantity: "",
    productionDate: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortAscending, setSortAscending] = useState(true)

  console.log("[v0] Form initialized with data")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [onlineProductsRes, productionProductsRes, linesRes, employeesRes] = await Promise.all([
          fetch("/api/admin/production/products"),
          fetch("/api/admin/production/production-products"),
          fetch("/api/admin/production/production-lines"),
          fetch("/api/admin/production/employees"),
        ])

        const allProducts: Product[] = []

        if (productionProductsRes.ok) {
          const productionProductsData = await productionProductsRes.json()
          const prodProducts = productionProductsData
            .filter((p: any) => p.active)
            .map((p: any) => ({
              id: `production-${p.id}`,
              name: p.name,
              type: "production" as const,
              production_line_id: p.production_line_id,
            }))
          allProducts.push(...prodProducts)
        }

        setProducts(allProducts)

        if (linesRes.ok) {
          const linesData = await linesRes.json()
          setLocalProductionLines(linesData)
        }

        if (employeesRes.ok) {
          const employeesData = await employeesRes.json()
          setEmployees(employeesData.filter((e: Employee & { active: boolean }) => e.active))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = formData.productionLineId
    ? products
        .filter((p) => p.production_line_id === Number.parseInt(formData.productionLineId))
        .sort((a, b) => {
          const comparison = a.name.localeCompare(b.name, "bg-BG")
          return sortAscending ? comparison : -comparison
        })
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.productionLineId || !formData.productId || !formData.partnerEmployeeId || !formData.quantity) {
      toast.error("Моля попълнете всички задължителни полета")
      return
    }

    const currentEmployee = getCurrentEmployee()
    if (!currentEmployee) {
      toast.error("Моля влезте в системата отново")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/productions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-employee-id": currentEmployee.id.toString(),
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Производството е добавено успешно!")
        onSuccess()
        onClose()
      } else {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401) {
          toast.error("Моля влезте в системата отново")
        } else {
          toast.error(errorData.error || "Грешка при добавяне на производството")
        }
      }
    } catch (error) {
      console.error("[v0] Production form submission error:", error)
      toast.error("Грешка при добавяне на производството")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">Ново производство</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productionLine">Производствена линия *</Label>
              <Select
                value={formData.productionLineId}
                onValueChange={(value) => {
                  setFormData({ ...formData, productionLineId: value, productId: "" })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Изберете линия..." />
                </SelectTrigger>
                <SelectContent>
                  {localProductionLines && localProductionLines.length > 0 ? (
                    localProductionLines.map((line) => (
                      <SelectItem key={line.id} value={line.id.toString()}>
                        {line.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">Няма налични линии</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="product">Продукт *</Label>
                {formData.productionLineId && filteredProducts.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortAscending(!sortAscending)}
                    className="h-8 gap-1 text-xs"
                  >
                    <ArrowUpDown className="h-3 w-3" />
                    {sortAscending ? "А → Я" : "Я → А"}
                  </Button>
                )}
              </div>
              <Select
                value={formData.productId}
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
                disabled={!formData.productionLineId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Изберете продукт..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts && filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {formData.productionLineId
                        ? "Няма налични продукти за тази линия"
                        : "Първо изберете производствена линия"}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partner">Партньор (служител) *</Label>
              <Select
                value={formData.partnerEmployeeId}
                onValueChange={(value) => setFormData({ ...formData, partnerEmployeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Изберете партньор..." />
                </SelectTrigger>
                <SelectContent>
                  {employees && employees.length > 0 ? (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">Няма налични служители</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Количество (брой) *</Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productionDate">Дата на производство</Label>
              <Input
                id="productionDate"
                type="date"
                value={formData.productionDate}
                onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Бележки</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Аромат, модел, цвят и др..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Отказ
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-amber-600 hover:bg-amber-700">
                {isSubmitting ? "Запазване..." : "Запази"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
