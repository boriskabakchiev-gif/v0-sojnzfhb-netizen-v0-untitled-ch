import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const productId = Number(id)
    const body = await request.json()

    const { name, production_line_id, daily_target, sales_value, active } = body

    const result = await sql`
      UPDATE production_products 
      SET 
        name = COALESCE(${name !== undefined ? name.trim() : null}, name),
        production_line_id = COALESCE(${production_line_id !== undefined ? (production_line_id ? Number(production_line_id) : null) : null}, production_line_id),
        daily_target = COALESCE(${daily_target !== undefined ? Number(daily_target) : null}, daily_target),
        sales_value = COALESCE(${sales_value !== undefined ? Number(sales_value) : null}, sales_value),
        active = COALESCE(${active !== undefined ? active : null}, active),
        updated_at = NOW()
      WHERE id = ${productId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Production product not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating production product:", error)
    return NextResponse.json({ error: "Failed to update production product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const productId = Number(id)

    const result = await sql`
      DELETE FROM production_products 
      WHERE id = ${productId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Production product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting production product:", error)
    return NextResponse.json({ error: "Failed to delete production product" }, { status: 500 })
  }
}
