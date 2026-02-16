"use client"

import { ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/cart-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function CartIcon() {
  const { getItemCount } = useCart()
  const itemCount = getItemCount()
  const pathname = usePathname()

  // Определяме дали сме на английската версия
  const isEnglish = pathname.startsWith("/en")
  const cartUrl = isEnglish ? "/en/cart" : "/cart"
  const ariaLabel = isEnglish ? "Shopping list" : "Списък за запитване"

  return (
    <Link href={cartUrl}>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-gray-300 hover:text-yellow-400"
        aria-label={ariaLabel}
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[20px] h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
            {itemCount}
          </Badge>
        )}
      </Button>
    </Link>
  )
}
