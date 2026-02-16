import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const products = await sql`
      SELECT 
        title as name,
        objectid as id,
        price,
        description,
        createdat as created_at,
        deleted
      FROM new_products 
      WHERE deleted = false OR deleted IS NULL
      ORDER BY title
    `

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, price, description } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO new_products (title, price, description, objectid, createdat, deleted)
      VALUES (${name.trim()}, ${price || 0}, ${description?.trim() || ""}, gen_random_uuid()::text, NOW(), false)
      RETURNING title as name, objectid as id, price, description, createdat as created_at
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error adding product:", error)
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 })
  }
}
