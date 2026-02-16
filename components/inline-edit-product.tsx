"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, Edit, Euro } from "lucide-react"
import { toast } from "sonner"

interface InlineEditProductProps {
  id: string
  field: string
  value: string | number
  type?: "text" | "number" | "textarea" | "select"
  options?: { value: string; label: string }[]
  label?: string
  onUpdate?: (newValue: string) => void
}

export function InlineEditProduct({
  id,
  field,
  value,
  type = "text",
  options = [],
  label,
  onUpdate,
}: InlineEditProductProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value?.toString() || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = () => {
    setEditValue(value?.toString() || "")
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/products/quick-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          field,
          value: type === "number" ? Number(editValue) : editValue,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Полето е обновено успешно")
        setIsEditing(false)
        if (onUpdate) {
          onUpdate(editValue)
        }
      } else {
        toast.error(data.error || "Грешка при обновяване на полето")
      }
    } catch (error) {
      console.error("Error updating field:", error)
      toast.error("Грешка при обновяване на полето")
    } finally {
      setIsLoading(false)
    }
  }

  // Функция за форматиране на стойността според типа поле
  const formatValue = (val: string | number) => {
    if (field === "price" || field === "retailerprice" || field === "wholesalerprice" || field === "europe_price") {
      return `${val} лв.`
    }
    return val
  }

  // Функция за показване на правилната икона според типа поле
  const getFieldIcon = () => {
    if (field === "europe_price") {
      return <Euro className="h-4 w-4 mr-1 text-blue-500" />
    }
    return null
  }

  // Функция за показване на правилния етикет според типа поле
  const getFieldLabel = () => {
    if (label) return label

    switch (field) {
      case "title":
        return "Име"
      case "description":
        return "Описание"
      case "price":
        return "Цена"
      case "retailerprice":
        return "Цена на дребно"
      case "wholesalerprice":
        return "Цена на едро"
      case "europe_price":
        return "Цена в евро"
      case "cateid":
        return "Категория"
      case "subcateid":
        return "Подкатегория"
      case "photourl":
        return "URL на снимка"
      default:
        return field
    }
  }

  return (
    <div className="flex flex-col space-y-1">
      <div className="text-sm font-medium text-gray-500 flex items-center">
        {getFieldIcon()}
        {getFieldLabel()}
      </div>
      {isEditing ? (
        <div className="flex items-center space-x-2">
          {type === "textarea" ? (
            <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-20 min-h-[80px]" />
          ) : type === "select" ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Изберете..." />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              step={type === "number" ? "0.01" : undefined}
            />
          )}
          <div className="flex space-x-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={handleSave}
              disabled={isLoading}
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between group">
          <div className="text-base flex items-center">
            {getFieldIcon()}
            {formatValue(value)}
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
