"use client"

import { ShoppingBag } from "lucide-react"
import { useCart } from "@/context/cart-context"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function CartIcon() {
  const { getItemCount } = useCart()
  const itemCount = getItemCount()
  const pathname = usePathname()

  const isEnglish = pathname.startsWith("/en")
  const cartUrl = isEnglish ? "/en/cart" : "/cart"
  const ariaLabel = isEnglish ? "Shopping list" : "Списък за запитване"

  return (
    <Link href={cartUrl}>
      <button
        className="relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        aria-label={ariaLabel}
      >
        <ShoppingBag className="h-[18px] w-[18px]" />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-neutral-900 text-[10px] font-bold leading-none">
            {itemCount}
          </span>
        )}
      </button>
    </Link>
  )
}
