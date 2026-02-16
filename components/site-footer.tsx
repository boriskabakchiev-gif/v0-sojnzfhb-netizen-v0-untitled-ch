import Link from "next/link"
import { FaTiktok } from "react-icons/fa"
import { Facebook, Youtube, Instagram } from "lucide-react"

interface Category {
  id: string
  title: string
  title_en?: string
}

interface SiteFooterProps {
  categories?: Category[]
  isEnglish?: boolean
}

export function SiteFooter({ categories = [], isEnglish = false }: SiteFooterProps) {
  // Split categories into chunks for better layout
  const categoryChunks = []
  const chunkSize = Math.ceil(categories.length / 2)
  for (let i = 0; i < categories.length; i += chunkSize) {
    categoryChunks.push(categories.slice(i, i + chunkSize))
  }

  const currentYear = new Date().getFullYear()

  if (isEnglish) {
    return (
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              {categories.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/en/category/${category.id}`}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {category.title_en || category.title}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No categories available.</p>
              )}
            </div>

            {/* About Madix */}
            <div>
              <h3 className="text-lg font-semibold mb-4">About Madix</h3>
              <div className="space-y-2">
                <Link href="/en/about" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  About us
                </Link>
                <Link href="/en/contact" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
                <a
                  href="https://96ghfafarqg1wwmp.public.blob.vercel-storage.com/Catalog%202025%20Web.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Catalog
                </a>
              </div>
            </div>

            {/* Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Information</h3>
              <div className="space-y-2">
                <Link href="/en/terms" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Terms and Conditions
                </Link>
                <Link
                  href="/en/delivery-returns"
                  className="block text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Shipping and Returns
                </Link>
                <Link href="/en/payment" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Payment
                </Link>
                <Link href="/en/privacy" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex space-x-6 mb-4 md:mb-0">
                <a
                  href="https://www.facebook.com/madiksbg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://www.youtube.com/@madixltd2794"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/madiks.bg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                {/* TikTok link for English version using FaTiktok icon */}
                <a
                  href="https://www.tiktok.com/@yourtiktokhandle" // Replace with actual TikTok URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="TikTok"
                >
                  <FaTiktok className="h-5 w-5" />
                </a>
              </div>
              <p className="text-gray-400 text-sm">© {currentYear} Madix Groundbaits. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  // Bulgarian version
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Категории</h3>
            {categories.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.id}`}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {category.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Няма налични категории.</p>
            )}
          </div>

          {/* About Madix */}
          <div>
            <h3 className="text-lg font-semibold mb-4">За Мадикс</h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-gray-300 hover:text-white transition-colors text-sm">
                За нас
              </Link>
              <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Контакти
              </Link>
              <a
                href="https://96ghfafarqg1wwmp.public.blob.vercel-storage.com/Catalog%202025%20Web.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-300 hover:text-white transition-colors text-sm"
              >
                Каталог
              </a>
            </div>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Информация</h3>
            <div className="space-y-2">
              <Link href="/terms" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Общи условия
              </Link>
              <Link href="/delivery-returns" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Доставка и връщане
              </Link>
              <Link href="/payment" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Плащане
              </Link>
              <Link href="/privacy" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Политика за поверителност
              </Link>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a
                href="https://www.facebook.com/madiksbg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@madixltd2794"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/madiks.bg/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              {/* TikTok link for Bulgarian version using FaTiktok icon */}
              <a
                href="https://www.tiktok.com/@madixltd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <FaTiktok className="h-5 w-5" />
              </a>
            </div>
            <p className="text-gray-400 text-sm">© {currentYear} Мадикс Граундбейтс. Всички права запазени.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
