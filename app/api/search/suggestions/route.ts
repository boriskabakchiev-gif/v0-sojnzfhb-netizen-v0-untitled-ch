import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit") || "5", 10)

    if (!query) {
      return NextResponse.json({ results: [] })
    }

    const searchTerm = `%${query}%`

    // Fetch search suggestions with a limit
    const results = await sql`
      SELECT 
        objectid, 
        title, 
        description,
        photourl, 
        price
      FROM new_products
      WHERE (title ILIKE ${searchTerm} OR description ILIKE ${searchTerm})
        AND (deleted = false OR deleted IS NULL)
      ORDER BY 
        CASE 
          WHEN title ILIKE ${`${query}%`} THEN 1  -- Starts with query (highest priority)
          WHEN title ILIKE ${`% ${query}%`} THEN 2  -- Contains query as a whole word
          ELSE 3  -- Contains query somewhere
        END,
        title ASC
      LIMIT ${limit}
    `

    // Format the results
    const formattedResults = results.map((product) => ({
      objectid: product.objectid,
      title: product.title,
      description: product.description,
      photourl: product.photourl,
      price:
        typeof product.price === "number"
          ? product.price.toFixed(2)
          : Number.parseFloat(product.price || "0").toFixed(2),
    }))

    return NextResponse.json({ results: formattedResults })
  } catch (error) {
    console.error("Error fetching search suggestions:", error)
    return NextResponse.json({ error: "Failed to fetch search suggestions" }, { status: 500 })
  }
}
