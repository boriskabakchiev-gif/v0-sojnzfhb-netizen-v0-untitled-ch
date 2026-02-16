"use client"

import Link from "next/link"
import Image from "next/image"
import { User, LogOut, Phone, Globe, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { MobileMenu } from "@/components/mobile-menu"
import { CartIcon } from "@/components/cart-icon"
import { SearchForm } from "@/components/search-form"

interface Category {
  id: string
  title: string
  deleted?: boolean
}

interface Subcategory {
  id: string
  cateid: string
  title: string
}

interface SiteHeaderProps {
  categories: Category[]
  subcategories?: Subcategory[]
  currentCategoryId?: string
  currentSubcategoryId?: string
  isLoggedIn?: boolean
  userName?: string
  isEnglishProp?: boolean
}

export function SiteHeader({
  categories,
  subcategories = [],
  currentCategoryId,
  currentSubcategoryId,
  isLoggedIn = false,
  userName = "",
  isEnglishProp = false,
}: SiteHeaderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn)
  const [name, setName] = useState(userName)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          setIsAuthenticated(data.isAuthenticated)
          setName(data.user?.name || "")
        }
      } catch (error) {
        console.error("Грешка при проверка на автентикация:", error)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setIsAuthenticated(false)
        setName("")
        const currentLocale = pathname.startsWith("/en") ? "/en" : "/"
        router.push(currentLocale)
        router.refresh()
      }
    } catch (error) {
      console.error("Грешка при изход:", error)
    }
  }

  const currentLocale = pathname.startsWith("/en") ? "en" : "bg"

  let pathWithoutLocale = pathname.startsWith("/en") ? pathname.substring(3) : pathname
  if (pathWithoutLocale === "") pathWithoutLocale = "/"

  const switchToEnglishPath = `/en${pathWithoutLocale}`
  const switchToBulgarianPath = pathWithoutLocale

  const handleLanguageChange = (locale: string) => {
    const newPath = locale === "en" ? switchToEnglishPath : switchToBulgarianPath
    window.location.href = newPath
    setShowLanguageDropdown(false)
  }

  // Fix the isEnglish prop detection
  const isEnglish = isEnglishProp || pathname.startsWith("/en")

  return (
    <>
      <header className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 shadow-lg fixed top-0 left-0 right-0 w-full z-[9999]">
        <div className="container mx-auto pl-0 pr-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={currentLocale === "en" ? "/en" : "/"} className="flex items-center flex-shrink-0 mr-2">
              <div className="relative h-10 w-28 sm:h-12 sm:w-40 transition-transform hover:scale-105">
                <Image
                  src="/images/design-mode/new-madiks.png"
                  alt="Madix Groundbaits"
                  fill
                  className="object-contain drop-shadow-sm"
                  priority
                />
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-6">
              <div className="w-full relative">
                <SearchForm
                  fullWidth={true}
                  placeholder={currentLocale === "en" ? "Search products..." : "Търсене на продукти..."}
                />
              </div>
            </div>

            {/* EFTA Badge - Desktop */}
            <div className="hidden lg:flex items-center">
              <div className="relative h-12 w-12 transition-transform hover:scale-110">
                <Image
                  src="/images/design-mode/Eftta-Member-removebg-preview.png"
                  alt="EFTA Member"
                  fill
                  className="object-contain drop-shadow-sm"
                />
              </div>
            </div>

            {/* Navigation Links - Desktop */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link
                href={currentLocale === "en" ? "/en/contact" : "/contact"}
                className="text-sm font-medium text-gray-200 hover:text-yellow-400 transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-600/50"
              >
                <Phone className="h-4 w-4" />
                <span>{currentLocale === "en" ? "Order now" : "Поръчай сега"}</span>
              </Link>

              <Link
                href={currentLocale === "en" ? "/" : "/en"}
                className="text-sm font-medium text-gray-200 hover:text-yellow-400 transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-600/50 border border-gray-600"
              >
                <Globe className="h-4 w-4" />
                <span>{currentLocale === "en" ? "БГ" : "EN"}</span>
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {/* Mobile Language Dropdown */}
              <div className="relative lg:hidden">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center px-2 py-2 text-gray-200 hover:text-yellow-400 transition-all duration-200 rounded-lg hover:bg-gray-600/50 border border-gray-600"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{currentLocale === "en" ? "EN" : "БГ"}</span>
                  <ChevronDown
                    className={`h-3 w-3 ml-1 transition-transform duration-200 ${showLanguageDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showLanguageDropdown && (
                  <div className="absolute right-0 top-full mt-2 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-50 min-w-[120px] overflow-hidden">
                    <button
                      onClick={() => handleLanguageChange("bg")}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-600 transition-colors ${
                        currentLocale !== "en" ? "bg-gray-600 text-yellow-400 font-medium" : "text-gray-200"
                      }`}
                    >
                      Български
                    </button>
                    <button
                      onClick={() => handleLanguageChange("en")}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-600 transition-colors ${
                        currentLocale === "en" ? "bg-gray-600 text-yellow-400 font-medium" : "text-gray-200"
                      }`}
                    >
                      English
                    </button>
                  </div>
                )}
              </div>

              {/* User Actions */}
              {isAuthenticated ? (
                <>
                  <Link href={currentLocale === "en" ? "/en/account/dashboard" : "/account/dashboard"}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-200 hover:text-yellow-400 hover:bg-gray-600/50 transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>
                  <CartIcon />
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-gray-200 hover:text-yellow-400 lg:hidden bg-transparent border-gray-600 hover:bg-gray-600/50 transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="hidden lg:flex bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-medium rounded-lg text-sm px-6 py-2 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {currentLocale === "en" ? "Logout" : "Изход"}
                  </Button>
                </>
              ) : (
                <>
                  <Link href={currentLocale === "en" ? "/en/account" : "/account"}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-200 hover:text-yellow-400 hover:bg-gray-600/50 transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>
                  <CartIcon />
                </>
              )}

              {/* Update the mobile menu call to properly pass the isEnglish prop */}
              <MobileMenu
                categories={categories}
                subcategories={subcategories}
                currentCategoryId={currentCategoryId}
                currentSubcategoryId={currentSubcategoryId}
                isEnglish={isEnglish}
              />
            </div>
          </div>
        </div>
      </header>
      {/* Spacer to prevent content from being hidden behind fixed headers */}
      <div className="h-[128px]"></div>
    </>
  )
}
