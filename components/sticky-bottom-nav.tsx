"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Grid3X3, ShoppingBag, User } from "lucide-react"
import { useCart } from "@/context/cart-context"

interface StickyBottomNavProps {
  isEnglish?: boolean
}

export function StickyBottomNav({ isEnglish = false }: StickyBottomNavProps) {
  const pathname = usePathname()
  const { items } = useCart()
  
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0)

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname === "/" || pathname === "/en") return "home"
    if (pathname.includes("/category") || pathname.includes("/subcategory")) return "categories"
    if (pathname.includes("/cart")) return "cart"
    if (pathname.includes("/account") || pathname.includes("/auth")) return "account"
    return "home"
  }

  const activeTab = getActiveTab()

  const navItems = [
    {
      id: "home",
      href: isEnglish ? "/en" : "/",
      icon: Home,
      label: isEnglish ? "Home" : "Начало",
    },
    {
      id: "search",
      href: isEnglish ? "/en" : "/",
      icon: Search,
      label: isEnglish ? "Search" : "Търсене",
      onClick: () => {
        // Scroll to top and focus search
        window.scrollTo({ top: 0, behavior: "smooth" })
      },
    },
    {
      id: "categories",
      href: isEnglish ? "/en" : "/",
      icon: Grid3X3,
      label: isEnglish ? "Categories" : "Категории",
    },
    {
      id: "cart",
      href: isEnglish ? "/en/cart" : "/cart",
      icon: ShoppingBag,
      label: isEnglish ? "Cart" : "Количка",
      badge: cartItemsCount > 0 ? cartItemsCount : undefined,
    },
    {
      id: "account",
      href: isEnglish ? "/en/account" : "/account",
      icon: User,
      label: isEnglish ? "Account" : "Профил",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Apple-style backdrop blur */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-neutral-200/50 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        <div className="safe-area-bottom">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id
              const Icon = item.icon

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={item.onClick}
                  className={`relative flex flex-col items-center justify-center min-w-[64px] py-1 px-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-neutral-900"
                      : "text-neutral-400 active:text-neutral-600"
                  }`}
                >
                  <div className="relative">
                    <Icon
                      className={`h-6 w-6 transition-transform duration-200 ${
                        isActive ? "scale-105" : ""
                      }`}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    {/* Cart badge */}
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-amber-500 rounded-full shadow-sm">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-1 text-[10px] font-medium tracking-tight ${
                      isActive ? "text-neutral-900" : "text-neutral-500"
                    }`}
                  >
                    {item.label}
                  </span>
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-neutral-900" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
