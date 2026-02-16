import { NextResponse } from "next/server"
import { getProductsByCategory, getFeaturedProducts } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const searchParams = new URLSearchParams(url.search)
    const category = searchParams.get("category")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 100

    console.log(`API: Fetching products with params: category=${category}, limit=${limit}`)

    let products = []

    if (category) {
      products = await getProductsByCategory(category)
      console.log(`API: Fetched ${products.length} products for category ${category}`)
    } else {
      products = await getFeaturedProducts(limit)
      console.log(`API: Fetched ${products.length} featured products`)
    }

    if (!products || products.length === 0) {
      console.log("API: No products found or error occurred")
      // Return empty array instead of error to prevent client-side crashes
      return NextResponse.json([])
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error("API Error fetching products:", error)
    // Return empty array instead of error to prevent client-side crashes
    return NextResponse.json([])
  }
}
