import type React from "react"
import { SiteHeader } from "@/components/site-header"
import { getCategories } from "@/lib/db" // Предполагам, че имате getSubcategories

export default async function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = await getCategories()
  // Ако SiteHeader използва и подкатегории, заредете ги тук
  // const subcategories = await getSubcategories();

  return (
    <>
      <SiteHeader categories={categories} /* subcategories={subcategories} */ />
      <main>{children}</main>
    </>
  )
}
