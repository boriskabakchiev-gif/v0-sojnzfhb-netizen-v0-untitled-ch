"use client"

import { useState } from "react"
import { ShoppingCart, Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context" // Import useCart

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ProductQuantityControlsProps {
  productId: string
  productTitle: string
  productPrice: number
  photoUrl?: string
  promo_buy_qty?: number | null
  promo_free_qty?: number | null
  disabled?: boolean
  isEnglish?: boolean
}

export function ProductQuantityControls({
  productId,
  productTitle,
  productPrice,
  photoUrl,
  promo_buy_qty,
  promo_free_qty,
  disabled = false,
  isEnglish = false,
}: ProductQuantityControlsProps) {
  const [quantity, setQuantity] = useState(1)
  const router = useRouter()
  const { addItem } = useCart() // Променено от 'addToCart' на 'addItem'

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    const finalQuantity = quantity < 1 ? 1 : quantity

    try {
      if (!productId || !productTitle || productPrice <= 0) {
        toast.error(isEnglish ? "Invalid product information" : "Невалидна информация за продукта")
        return
      }

      addItem({
        // Използваме 'addItem'
        id: productId,
        title: productTitle,
        price: productPrice,
        quantity: finalQuantity,
        photourl: photoUrl || "",
        promo_buy_qty: promo_buy_qty || null,
        promo_free_qty: promo_free_qty || null,
      })

      toast.success(
        isEnglish ? `${productTitle} added to cart successfully!` : `${productTitle} е добавен в количката успешно!`,
      )
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error(isEnglish ? "Error adding product to cart" : "Грешка при добавяне на продукта в количката")
    }
  }

  return (
    <div className="space-y-4">
      {/* Quantity Controls */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">{isEnglish ? "Quantity:" : "Количество:"}</span>
        <div className="flex items-center border border-gray-300 rounded-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || disabled}
            className="h-10 w-10 p-0 hover:bg-gray-100"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min="1"
            value={quantity === 0 ? "" : quantity}
            onChange={(e) => {
              const value = e.target.value
              if (value === "") {
                setQuantity(0)
              } else {
                const parsedValue = Number.parseInt(value)
                if (!isNaN(parsedValue)) {
                  setQuantity(parsedValue)
                }
              }
            }}
            disabled={disabled}
            className="w-16 text-center border-0 focus:ring-0 h-10"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={disabled}
            className="h-10 w-10 p-0 hover:bg-gray-100"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={disabled}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
        size="lg"
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isEnglish ? "Add to Cart" : "Добави в количката"}
      </Button>

      {disabled && (
        <p className="text-sm text-gray-500 text-center">
          {isEnglish ? "Price not available for your customer type" : "Цената не е налична за вашия тип клиент"}
        </p>
      )}
    </div>
  )
}
