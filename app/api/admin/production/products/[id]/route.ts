import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { deleted } = await request.json()
    const { id } = params

    const result = await sql`
      UPDATE new_products 
      SET deleted = ${deleted}
      WHERE objectid = ${id}
      RETURNING title as name, objectid as id, price, description, createdat as created_at, deleted
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}
