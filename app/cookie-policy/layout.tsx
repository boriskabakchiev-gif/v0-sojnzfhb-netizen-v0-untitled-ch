import type React from "react"
import { SiteHeader } from "@/components/site-header"
import { fetchCategoriesWithSubcategories } from "@/lib/data" // Предполагаме, че тази функция съществува

export default async function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { categories, subcategories } = await fetchCategoriesWithSubcategories()
  return (
    <>
      <SiteHeader categories={categories} subcategories={subcategories} />
      <main>{children}</main>
    </>
  )
}
