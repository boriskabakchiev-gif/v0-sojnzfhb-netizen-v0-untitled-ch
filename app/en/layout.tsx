import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { CartProvider } from "@/context/cart-context"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteFooter } from "@/components/site-footer"
import { getCategories } from "@/lib/db"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Madix Groundbaits - Professional Fishing Tackle",
  description: "Bulgaria's largest groundbait factory. High-quality fishing products since 1995.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Madiks",
  },
}

export default async function EnglishLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch categories for the footer
  const categories = await getCategories()

  // Transform categories to use English titles
  const englishCategories = (categories || []).map((category) => ({
    ...category,
    title: category.title_en || category.title,
  }))

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">{children}</main>
              <SiteFooter categories={englishCategories} isEnglish={true} />
            </div>
            <Toaster />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
