import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export const runtime = "nodejs"
export const fetchCache = "force-no-store"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const query = `
      SELECT p.*, c.name as category_name, s.name as subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.id = $1 AND p.is_active = true
    `

    const result = await sql.query(query, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
