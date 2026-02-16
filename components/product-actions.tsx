"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart, type CartItem } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Minus, Plus, ShoppingCart } from "lucide-react"

// Add a function to calculate potential free items
const calculatePotentialFreeItems = (quantity: number) => {
  return Math.floor(quantity / 10)
}

interface ProductActionsProps {
  id: string
  title: string
  price: number
  photourl?: string
  addToCart: () => void
}

const ProductActions: React.FC<ProductActionsProps> = ({ id, title, price, photourl, addToCart }) => {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const { toast } = useToast()

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleSendInquiry = () => {
    // Add the product to the cart regardless of login status
    const item: CartItem = {
      id,
      title,
      price,
      quantity,
      photourl,
    }

    addItem(item)

    toast({
      title: "Запитването е добавено",
      description: `${title} (${quantity} бр.) е добавено към списъка за запитване.`,
      action: (
        <Link href="/cart" className="bg-yellow-500 text-black px-3 py-1 rounded-md text-sm font-medium">
          Виж списъка
        </Link>
      ),
    })
  }

  return (
    <div className="flex items-center mb-8">
      <div className="flex items-center border border-gray-700 rounded-md mr-4">
        <button
          className="px-3 py-2 text-gray-400 hover:text-white"
          onClick={decreaseQuantity}
          aria-label="Намаляване на количеството"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="px-4 py-2 border-x border-gray-700">{quantity}</span>
        <button
          className="px-3 py-2 text-gray-400 hover:text-white"
          onClick={increaseQuantity}
          aria-label="Увеличаване на количеството"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button className="flex-1 bg-red-600 hover:bg-red-700 py-6" onClick={handleSendInquiry}>
        <ShoppingCart className="h-5 w-5 mr-2" /> Купи сега
      </Button>
    </div>
  )
}

export default ProductActions
