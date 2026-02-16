import { NextResponse } from "next/server"
import { getCategories } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    console.log("API: Fetching categories", id ? `with id: ${id}` : "all")

    // If specific ID is requested, fetch only that category
    if (id) {
      const categories = await getCategories(true)
      const category = categories.find((cat) => cat.id === id)

      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
      }

      return NextResponse.json([category])
    }

    // Otherwise fetch all categories
    const categories = await getCategories(true) // Skip cache to ensure fresh data

    if (!categories || categories.length === 0) {
      console.log("API: No categories found or error occurred")
      // Return empty array instead of error to prevent client-side crashes
      return NextResponse.json([])
    }

    console.log(`API: Successfully fetched ${categories.length} categories`)
    return NextResponse.json(categories)
  } catch (error) {
    console.error("API Error fetching categories:", error)
    // Return empty array instead of error to prevent client-side crashes
    return NextResponse.json([])
  }
}
