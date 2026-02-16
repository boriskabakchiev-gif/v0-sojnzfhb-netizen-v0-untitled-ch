import type React from "react"
import { SiteHeader } from "@/components/site-header"
import { getCategories } from "@/lib/db" // Assuming getSubcategories exists or can be added

export default async function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = await getCategories()
  // If your SiteHeader also uses subcategories, fetch them here
  // const subcategories = await getSubcategories();

  return (
    <>
      <SiteHeader categories={categories} /* subcategories={subcategories} */ />
      <main>{children}</main>
    </>
  )
}
