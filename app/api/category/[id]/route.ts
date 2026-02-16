import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export const runtime = "nodejs"
export const fetchCache = "force-no-store"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const categoryQuery = `
      SELECT c.*, 
             (SELECT json_agg(s.*) 
              FROM subcategories s 
              WHERE s.category_id = c.id AND s.is_active = true) as subcategories
      FROM categories c
      WHERE c.id = $1 AND c.is_active = true
    `

    const categoryResult = await sql.query(categoryQuery, [id])

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const productsQuery = `
      SELECT p.*, c.name as category_name, s.name as subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.category_id = $1 AND p.is_active = true
      ORDER BY p.name
    `

    const productsResult = await sql.query(productsQuery, [id])

    return NextResponse.json({
      category: categoryResult.rows[0],
      products: productsResult.rows,
    })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}
