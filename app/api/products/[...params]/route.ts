import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export const runtime = "nodejs"
export const fetchCache = "force-no-store"

export async function GET(request: Request, { params }: { params: { params: string[] } }) {
  try {
    const url = new URL(request.url)
    const searchParams = new URLSearchParams(url.search)
    const categoryId = searchParams.get("categoryId")
    const subcategoryId = searchParams.get("subcategoryId")
    const search = searchParams.get("search")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 100

    let query = `
      SELECT p.*, c.name as category_name, s.name as subcategory_name
      FROM new_products p
      LEFT JOIN categories c ON p.cateid = c."Document ID"
      LEFT JOIN subcategories s ON p.subcateid = s."Document ID"
      WHERE p.deleted = false OR p.deleted IS NULL
    `

    const queryParams: any[] = []

    if (categoryId) {
      query += ` AND p.cateid = $${queryParams.length + 1}`
      queryParams.push(categoryId)
    }

    if (subcategoryId) {
      query += ` AND p.subcateid = $${queryParams.length + 1}`
      queryParams.push(subcategoryId)
    }

    if (search) {
      query += ` AND (p.title ILIKE $${queryParams.length + 1} OR p.description ILIKE $${queryParams.length + 1})`
      queryParams.push(`%${search}%`)
    }

    query += ` ORDER BY p.title ASC LIMIT $${queryParams.length + 1}`
    queryParams.push(limit)

    const result = await sql.query(query, queryParams)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
