"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, ShoppingCart, Gift, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { useCart, type CartItem } from "@/context/cart-context"
import { useRouter } from "next/navigation"

interface ProductCardProps {
  id: string
  title: string
  description?: string
  price: number // Standard price
  retailerprice?: number | null
  wholesalerprice?: number | null
  europe_price?: number | null
  photourl?: string
  isLoggedIn: boolean
  customerType?: string | null
  discountPercent?: number
  isNew?: boolean
  discount?: number
  promo_buy_qty?: number | null
  promo_free_qty?: number | null
  promo_description?: string | null
  isEnglish?: boolean
}

export function ProductCard({
  id,
  title,
  description,
  price,
  retailerprice,
  wholesalerprice,
  europe_price,
  photourl,
  isLoggedIn,
  customerType,
  discountPercent,
  isNew = false,
  discount = 0,
  promo_buy_qty,
  promo_free_qty,
  promo_description,
  isEnglish = false,
}: ProductCardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { addItem } = useCart()
  const [isHovered, setIsHovered] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const formatPriceDisplay = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return "N/A"
    }
    return Number(value).toFixed(2)
  }

  // Convert BGN to EUR (approximate rate: 1 EUR = 1.96 BGN)
  const convertBgnToEur = (bgnPrice: number): number => {
    return bgnPrice / 1.96
  }

  const isEuropeanCustomer = () => {
    const type = customerType?.toLowerCase()
    return type === "european" || type === "europen"
  }

  const getBasePriceForCustomer = (): number | null => {
    if (!isLoggedIn) {
      return Number(price)
    }
    const type = customerType?.toLowerCase()
    if (isEuropeanCustomer()) {
      return europe_price !== undefined && europe_price !== null ? Number(europe_price) : null
    } else if (type === "wholesaler" || type === "едро") {
      return wholesalerprice !== undefined && wholesalerprice !== null ? Number(wholesalerprice) : null
    } else if (type === "retailer" || type === "дребно") {
      return retailerprice !== undefined && retailerprice !== null ? Number(retailerprice) : null
    } else {
      return Number(price)
    }
  }

  const displayPriceNumber = getBasePriceForCustomer()

  const getPriceLabel = (): string => {
    if (!isLoggedIn) return isEnglish ? "Standard Price" : "Стандартна цена"
    const type = customerType?.toLowerCase()
    if (isEuropeanCustomer()) return isEnglish ? "Price for European customers" : "Цена за европейски клиенти"
    if (type === "wholesaler" || type === "едро") return isEnglish ? "Wholesale Price" : "Цена за търговци на едро"
    if (type === "retailer" || type === "дребно") return isEnglish ? "Retail Price" : "Цена за търговци на дребно"
    return isEnglish ? "Standard Price" : "Стандартна цена"
  }

  const handleAddToCart = () => {
    if (displayPriceNumber === null || isAdded) return

    const priceForCart = displayPriceNumber

    const itemToAdd: CartItem = {
      id,
      title,
      price: priceForCart,
      quantity: 1,
      photourl,
      promo_buy_qty: promo_buy_qty,
      promo_free_qty: promo_free_qty,
      isEuropeanPrice: isEuropeanCustomer(),
    }
    addItem(itemToAdd)

    toast({
      title: isEnglish ? "Product added to cart" : "Продуктът е добавен в количката",
      description: isEnglish ? `${title} has been added successfully.` : `${title} е добавен успешно.`,
      action: (
        <Button variant="outline" size="sm" onClick={() => router.push("/cart")}>
          {isEnglish ? "View Cart" : "Виж количката"}
        </Button>
      ),
    })

    setIsAdded(true)
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  let finalPromotionDisplayMessage: string | null = null
  if (promo_buy_qty && promo_buy_qty > 0 && promo_free_qty !== undefined && promo_free_qty >= 0) {
    if (promo_description) {
      finalPromotionDisplayMessage = promo_description
    } else if (promo_free_qty > 0) {
      finalPromotionDisplayMessage = isEnglish
        ? `Buy ${promo_buy_qty}, Get ${promo_free_qty} Free!`
        : `Купи ${promo_buy_qty}, Вземи ${promo_free_qty} безплатно!`
    } else {
      finalPromotionDisplayMessage = isEnglish
        ? `Special offer when buying ${promo_buy_qty} pcs.`
        : `Специална оферта при покупка на ${promo_buy_qty} бр.`
    }
  }

  const showQuantityPromoBadgeOnImage = promo_buy_qty && promo_buy_qty > 0 && promo_free_qty && promo_free_qty > 0

  const productUrl = isEnglish ? `/en/product/${id}` : `/product/${id}`

  // Handle navigation with refresh for English version
  const handleProductClick = (e: React.MouseEvent) => {
    if (isEnglish) {
      e.preventDefault()
      window.location.href = productUrl
    }
  }

  // Modified to always redirect to the product page
  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent default behavior if any parent link exists
    router.push(productUrl)
  }

  return (
    <Card
      className="group overflow-hidden border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden sm:h-56 md:h-64 bg-white">
        {isEnglish ? (
          <div className="block w-full h-full cursor-pointer" onClick={handleProductClick}>
            {photourl ? (
              <Image
                src={photourl || "/placeholder.svg"}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-scale-down transition-transform duration-500 ${isHovered ? "scale-105" : "scale-100"}`}
                onError={(e) => {
                  e.currentTarget.src = `/placeholder.svg?height=256&width=256&text=${encodeURIComponent(title)}`
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-gray-500">{isEnglish ? "No image" : "Няма снимка"}</span>
              </div>
            )}
          </div>
        ) : (
          <Link href={productUrl} className="block w-full h-full">
            {photourl ? (
              <Image
                src={photourl || "/placeholder.svg"}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-scale-down transition-transform duration-500 ${isHovered ? "scale-105" : "scale-100"}`}
                onError={(e) => {
                  e.currentTarget.src = `/placeholder.svg?height=256&width=256&text=${encodeURIComponent(title)}`
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-gray-500">{isEnglish ? "No image" : "Няма снимка"}</span>
              </div>
            )}
          </Link>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-2 z-10">
          {isNew && <Badge className="bg-blue-600 text-white hover:bg-blue-700">{isEnglish ? "New" : "Ново"}</Badge>}
          {showQuantityPromoBadgeOnImage && (
            <Badge className="bg-orange-500 text-white hover:bg-orange-600 flex items-center">
              <Gift className="mr-1 h-3 w-3" />
              {`${promo_buy_qty}+${promo_free_qty}`}
            </Badge>
          )}
        </div>
        <div
          className={`absolute bottom-0 left-0 right-0 flex justify-center gap-2 bg-gradient-to-t from-black/60 via-black/40 to-transparent p-3 transition-all duration-300 z-10 ${
            isHovered ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <Button
            variant="outline"
            size="sm"
            className="border-white/50 bg-white/80 text-gray-800 backdrop-blur-sm hover:bg-white"
            onClick={handleQuickViewClick}
          >
            <Eye className="mr-1 h-4 w-4" />
            {isEnglish ? "Quick View" : "Бърз преглед"}
          </Button>
        </div>
      </div>

      <CardContent className="flex flex-grow flex-col gap-3 p-4">
        {isEnglish ? (
          <div className="block cursor-pointer" onClick={handleProductClick}>
            <h3 className="mb-1 line-clamp-2 min-h-[2.5rem] text-base font-semibold text-gray-800 transition-colors hover:text-red-600 md:text-lg">
              {title}
            </h3>
          </div>
        ) : (
          <Link href={productUrl} className="block">
            <h3 className="mb-1 line-clamp-2 min-h-[2.5rem] text-base font-semibold text-gray-800 transition-colors hover:text-red-600 md:text-lg">
              {title}
            </h3>
          </Link>
        )}

        {description && (
          <p className="line-clamp-2 text-xs text-gray-600 md:text-sm whitespace-pre-wrap">{description}</p>
        )}

        <div className="mt-auto">
          {finalPromotionDisplayMessage && (
            <div className="mb-2 p-2 bg-green-100 border border-green-300 rounded-md text-center">
              <p className="text-xs font-semibold text-green-700 md:text-sm flex items-center justify-center">
                <Gift className="h-4 w-4 mr-2 text-green-600 shrink-0" />
                {finalPromotionDisplayMessage}
              </p>
            </div>
          )}

          <div className="mb-2">
            <div className="text-xs text-gray-600 mb-0.5">{getPriceLabel()}</div>
            <div className="flex items-baseline gap-2 mb-0.5">
              {displayPriceNumber !== null ? (
                <div className="flex flex-col">
                  <div className="text-lg font-bold text-red-600 md:text-xl">
                    {formatPriceDisplay(displayPriceNumber)} лв.
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatPriceDisplay(convertBgnToEur(displayPriceNumber))} €
                  </div>
                </div>
              ) : (
                <div className="text-lg font-bold text-red-600 md:text-xl">N/A</div>
              )}
            </div>
          </div>

          <Button
            variant="default"
            className={`w-full text-white transition-colors duration-150 ease-in-out
              ${isAdded ? "bg-green-500 hover:bg-green-600" : "bg-red-600 hover:bg-red-700"}
              disabled:bg-gray-400 disabled:cursor-not-allowed`}
            size="sm"
            onClick={handleAddToCart}
            disabled={displayPriceNumber === null || isAdded}
            aria-label={
              isAdded
                ? isEnglish
                  ? "Product added successfully"
                  : "Продуктът е добавен успешно"
                : isEnglish
                  ? "Add to cart"
                  : "Добавяне в количка"
            }
          >
            {isAdded ? (
              <>
                <span className="hidden sm:inline-block">
                  <Check className="h-4 w-4 mr-1" />
                </span>
                {isEnglish ? "Added!" : "Добавено!"}
              </>
            ) : (
              <>
                <span className="hidden sm:inline-block">
                  <ShoppingCart className="h-4 w-4 mr-1" />
                </span>
                {isEnglish ? "Add to Cart" : "Добави в количка"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
