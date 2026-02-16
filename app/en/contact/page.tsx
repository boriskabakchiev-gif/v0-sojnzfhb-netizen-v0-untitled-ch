import { getCategories, getSubcategories } from "@/lib/db"
import ContactPageClient from "./ContactPageClient"

export const metadata = {
  title: "Contact Us | Madix Groundbaits",
  description: "Get in touch with Madix Groundbaits. Contact us for questions about our fishing products and services.",
}

export default async function ContactPage() {
  // Fetch data from the database on the server
  const categories = await getCategories()
  const allSubcategories = await getSubcategories()

  // Transform categories to use English titles, with proper null checking
  const englishCategories = (categories || []).map((category) => ({
    ...category,
    title: category.title_en || category.title, // Use title_en if available, fallback to title
  }))

  return <ContactPageClient categories={englishCategories} subcategories={allSubcategories || []} />
}
